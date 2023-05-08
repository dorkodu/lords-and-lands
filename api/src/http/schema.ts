import sage from "@dorkodu/sage-server";
import { NextFunction, Request, Response } from "express";
import controller from "./controller";

export interface SchemaContext {
  readonly req: Request;
  readonly res: Response;
  readonly next: NextFunction;
}

export type Schema = typeof schema
export const schema = sage.schema(
  {} as SchemaContext,
  {
    auth: controller.auth,
    login: controller.login,
    logout: controller.logout,
    logoutAll: controller.logoutAll,
    
    subscribe: controller.subscribe,
    manageSubscription: controller.manageSubscription,
  }
)