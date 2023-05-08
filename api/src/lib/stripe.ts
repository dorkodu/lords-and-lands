import { Stripe } from "stripe";
import { config } from "../config";

export const stripe = new Stripe(config.stripeAPIKey, { apiVersion: "2022-11-15" });