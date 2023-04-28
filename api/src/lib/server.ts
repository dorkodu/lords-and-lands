import http from "http";
import { express } from "./express";

export const server = http.createServer(express);