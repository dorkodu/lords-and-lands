import _express from "express";
import cookieParser from "cookie-parser";
import { schema } from "../http/schema";
import { config } from "../config";
import { stripe } from "./stripe";
import pg from "./pg";

export const express = _express();
express.set("trust proxy", true);
express.disable('x-powered-by');

express.use("/api/stripe/webhook", _express.raw({ type: 'application/json' }), async (req, res, _next) => {
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (err: any) {
    console.log(err)
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  let customerId = (event.data.object as any).customer;

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.resumed':
      await pg`UPDATE users SET subscribed=true WHERE customer_id=${customerId}`;
      break;
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused':
      await pg`UPDATE users SET subscribed=false WHERE customer_id=${customerId}`;
      break;
  }

  res.send();
});

express.use(_express.json());
express.use(cookieParser());

express.use("/api", async (req, res, next) => {
  res.status(200).send(await schema.execute(() => ({ req, res, next }), req.body));
});