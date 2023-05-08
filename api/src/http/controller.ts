import sage from "@dorkodu/sage-server";
import { SchemaContext } from "./schema";
import { z } from "zod";
import { loginSchema } from "./schemas";
import { ErrorCode } from "../types/error_code";
import axios from "axios";
import pg from "../lib/pg";
import { token } from "../lib/token";
import { Response } from "express";
import { snowflake } from "../lib/snowflake";
import { crypto } from "../lib/crypto";
import { date } from "../lib/date";
import { stripe } from "../lib/stripe";
import { config } from "../config";
import { data } from "../websocket/data";

const auth = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: { name: string, subscribed: boolean }; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(token.get(ctx.req));
    if (!authInfo) return { error: ErrorCode.Default };

    const [result0]: [{ name: string, subscribed: boolean }] = await pg`
      SELECT name, subscribed FROM users WHERE id=${authInfo.userId}
    `;
    if (!result0) return { error: ErrorCode.Default };

    return { data: result0 };
  }
);

const login = sage.resource(
  {} as SchemaContext,
  {} as z.infer<typeof loginSchema>,
  async (arg, ctx): Promise<{ data?: { name: string, subscribed: boolean }, error?: ErrorCode }> => {
    const parsed = loginSchema.safeParse(arg);
    if (!parsed.success) return { error: ErrorCode.Default };

    const userInfo = await fetchUserInfo(parsed.data.value);
    if (!userInfo) return { error: ErrorCode.Default };

    const [result0]: [{ subscribed: boolean }?] = await pg`
      SELECT subscribed FROM users WHERE id=${`google|${userInfo.sub}`}
    `;

    // If first time logging in
    if (!result0) {
      const row = {
        id: `google|${userInfo.sub}`,
        name: userInfo.name,
        email: userInfo.email,
        customerId: null,
        subscribed: false,
      };

      const result1 = await pg`INSERT INTO users ${pg(row)}`;
      if (result1.count === 0) return { error: ErrorCode.Default };
    }
    // If already logged in before
    else {
      const result1 = await pg`
        UPDATE users
        SET name=${userInfo.name}, email=${userInfo.email}
        WHERE id=${`google|${userInfo.sub}`}
      `;
      if (result1.count === 0) return { error: ErrorCode.Default };
    }

    if (!await queryCreateSession(ctx.res, `google|${userInfo.sub}`)) {
      return { error: ErrorCode.Default };
    }

    return { data: { name: userInfo.name, subscribed: result0?.subscribed ?? false } };
  }
);

const logout = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(token.get(ctx.req));
    if (!authInfo) return { error: ErrorCode.Default };

    await queryDeleteSession(ctx.res, authInfo.sessionId, authInfo.userId);

    const player = data.players[authInfo.userId];
    if (player) player.socket?.disconnect(true);

    return {};
  }
);

const logoutAll = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(token.get(ctx.req));
    if (!authInfo) return { error: ErrorCode.Default };

    await queryDeleteAllSessions(ctx.res, authInfo.userId);

    const player = data.players[authInfo.userId];
    if (player) player.socket?.disconnect(true);

    return { data: {} };
  }
);

const subscribe = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: { url: string }; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(token.get(ctx.req));
    if (!authInfo) return { error: ErrorCode.Default };

    const [result0]: [{ customerId: string | null, name: string, email: string }] = await pg`
      SELECT customer_id, name, email FROM users WHERE id=${authInfo.userId}
    `;
    if (!result0) return { error: ErrorCode.Default };

    if (!result0.customerId) {
      const customer = await stripe.customers.create({
        name: result0.name,
        email: result0.email,
        metadata: { userId: authInfo.userId },
      });

      await pg`UPDATE users SET customer_id=${customer.id}`;
      result0.customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: result0.customerId,
      customer_update: { name: "auto", address: "auto", shipping: "auto" },
      mode: "subscription",
      line_items: [{ price: config.stripeSubPrice, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: "https://lordsandlands.dorkodu.com",
      cancel_url: "https://lordsandlands.dorkodu.com",
    });
    if (!session.url) return { error: ErrorCode.Default };

    return { data: { url: session.url } };
  }
);

const manageSubscription = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: { url: string }; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(token.get(ctx.req));
    if (!authInfo) return { error: ErrorCode.Default };

    const [result0]: [{ customerId: string | null, }] = await pg`
      SELECT customer_id FROM users WHERE id=${authInfo.userId}
    `;
    if (!result0) return { error: ErrorCode.Default };
    if (!result0.customerId) return { error: ErrorCode.Default };

    const session = await stripe.billingPortal.sessions.create({
      customer: result0.customerId,
      return_url: "https://lordsandlands.dorkodu.com",
    });

    if (!session.url) return { error: ErrorCode.Default };

    return { data: { url: session.url } };
  }
);

async function getAuthInfo(rawToken: string | undefined) {
  if (!rawToken) return undefined;
  const parsedToken = rawToken ? token.parse(rawToken) : undefined;
  if (!parsedToken) return undefined;

  const session = await queryGetSession(rawToken);
  if (!session) return undefined;
  if (!token.check(session, parsedToken.validator)) return undefined;

  return { sessionId: session.id, userId: session.userId };
}

async function fetchUserInfo(token: string): Promise<{ sub: string, name: string, email: string } | undefined> {
  return new Promise((resolve) => {
    axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`)
      .catch(() => { resolve(undefined) })
      .then((value) => { resolve(value!.data) })
  });
}

async function queryCreateSession(res: Response, userId: string) {
  const tkn = token.create();
  const row = {
    id: snowflake.id("sessions"),
    user_id: userId,
    selector: tkn.selector,
    validator: crypto.sha256(tkn.validator),
    expiresAt: date.day(30),
  };

  const result = await pg`INSERT INTO sessions ${pg(row)}`;
  if (result.count === 0) return false;

  token.attach(res, { value: tkn.full, expiresAt: row.expiresAt });
  return true;
}

async function queryDeleteSession(res: Response, id: string, userId: string) {
  await pg`DELETE FROM sessions WHERE id=${id} AND user_id=${userId}`;
  token.detach(res);
}

async function queryDeleteAllSessions(res: Response, userId: string) {
  await pg`DELETE FROM sessions WHERE user_id=${userId}`;
  token.detach(res);
}

async function queryGetSession(rawToken: string | undefined) {
  if (!rawToken) return undefined;
  const parsedToken = rawToken ? token.parse(rawToken) : undefined;
  if (!parsedToken) return undefined;

  const [result]: [{ id: string; userId: string; validator: Buffer; expiresAt: string }?] = await pg`
    SELECT id, user_id, validator, expires_at FROM sessions WHERE selector=${parsedToken.selector}
  `;

  return result;
}

export default {
  auth,
  login,
  logout,
  logoutAll,

  subscribe,
  manageSubscription,

  getAuthInfo,
}