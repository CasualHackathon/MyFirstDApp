import { hc, type InferResponseType } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";
export type { InferResponseType };
export const apiClient = hc<AppType>("/").api;
