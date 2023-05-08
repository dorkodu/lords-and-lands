import { z } from "zod";

export const loginSchema = z.object({
  type: z.enum(["google"]),
  value: z.string(),
}).strict();