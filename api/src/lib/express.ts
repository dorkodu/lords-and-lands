import _express from "express";
import cookieParser from "cookie-parser";

export const express = _express();
//app.set("trust proxy", true);
express.disable('x-powered-by');
express.use(_express.json());
express.use(cookieParser());