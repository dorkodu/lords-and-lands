import sage from "@dorkodu/sage-server";
import { SchemaContext } from "./schema";
import { z } from "zod";
import { loginSchema } from "./schemas";
import { ErrorCode } from "../types/error_code";
import axios from "axios";
import pg from "../lib/pg";
import { token } from "../lib/token";
import { Request, Response } from "express";
import { snowflake } from "../lib/snowflake";
import { crypto } from "../lib/crypto";
import { date } from "../lib/date";
import { stripe } from "../lib/stripe";

const auth = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: { name: string, subscribed: boolean }; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(ctx.req);
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

    const [result0]: [{ exists: boolean }?] = await pg`
      SELECT EXISTS (
        SELECT * FROM users WHERE id=${`google|${userInfo.sub}`}
      )
    `;
    if (!result0) return { error: ErrorCode.Default };

    // If first time logging in
    if (!result0.exists) {
      const row = {
        id: `google|${userInfo.sub}`,
        name: userInfo.name,
        email: userInfo.email,
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

    return { data: { name: userInfo.name, subscribed: false } };
  }
);

const logout = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(ctx.req);
    if (!authInfo) return { error: ErrorCode.Default };

    await queryDeleteSession(ctx.res, authInfo.sessionId, authInfo.userId);

    return {};
  }
);

const logoutAll = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: {}; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(ctx.req);
    if (!authInfo) return { error: ErrorCode.Default };

    await queryDeleteAllSessions(ctx.res, authInfo.userId);

    return { data: {} };
  }
);

const subscribe = sage.resource(
  {} as SchemaContext,
  undefined,
  async (_arg, ctx): Promise<{ data?: { url: string }; error?: ErrorCode }> => {
    const authInfo = await getAuthInfo(ctx.req);
    if (!authInfo) return { error: ErrorCode.Default };

    const [result0]: [{ name: string, email: string }] = await pg`
      SELECT name, email FROM users WHERE id=${authInfo.userId}
    `;
    if (!result0) return { error: ErrorCode.Default };

    const customer = await stripe.customers.create({
      name: result0.name,
      email: result0.email,
      metadata: { userId: authInfo.userId },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [{ price: "price_1N5UeHLpx9cgle4utdU8CpLO", quantity: 1 }],
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
    const authInfo = await getAuthInfo(ctx.req);
    if (!authInfo) return { error: ErrorCode.Default };

    const [result0]: [{ name: string, email: string }] = await pg`
      SELECT name, email FROM users WHERE id=${authInfo.userId}
    `;
    if (!result0) return { error: ErrorCode.Default };

    const customer = await stripe.customers.create({
      name: result0.name,
      email: result0.email,
      metadata: { userId: authInfo.userId },
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: "https://lordsandlands.dorkodu.com",
    });

    if (!session.url) return { error: ErrorCode.Default };

    return { data: { url: session.url } };
  }
);

async function getAuthInfo(req: Request) {
  const rawToken = token.get(req);
  const parsedToken = rawToken ? token.parse(rawToken) : undefined;
  if (!parsedToken) return undefined;

  const session = await queryGetSession(req);
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

async function queryGetSession(req: Request) {
  const rawToken = token.get(req);
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
}