import _express from "express";
import cookieParser from "cookie-parser";
import { schema } from "../http/schema";

export const express = _express();
express.set("trust proxy", true);
express.disable('x-powered-by');
express.use(_express.json());
express.use(cookieParser());

express.use("/api", async (req, res, next) => {
  res.status(200).send(await schema.execute(() => ({ req, res, next }), req.body));
});