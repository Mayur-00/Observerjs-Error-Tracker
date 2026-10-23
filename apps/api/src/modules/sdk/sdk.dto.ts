import { z } from "zod";
import type { ErrorPayload } from "./sdk.types.js"; // use your shared package's real name

export const reqContextSchema = z.object({
  method: z.string().min(1).max(10),
  route: z.string().min(1).max(2048),
  userAgent: z.string().max(1024).nullable(), // required key, value may be null
});

export const errorContextSchema = z.object({
  errorType: z.string().min(1).max(200),
  message: z.string().max(5_000),
  stackTrace: z.string().max(20_000),
  filePath: z.string().max(1024),
  errorLineNumber: z.number().int().nonnegative(),
  errorColomnNumber: z.number().int().nonnegative(),
});

export const deviceContextSchema = z.object({
  os: z.enum([
    "aix",
    "android",
    "cygwin",
    "darwin",
    "freebsd",
    "haiku",
    "linux",
    "netbsd",
    "openbsd",
    "sunos",
    "win32",
  ]),
  osVersion: z.string().max(100),
  platform: z.string().max(32),
  platformVersion: z.string().max(100),
  environment: z.string().min(1).max(50),
});

export const errorPayloadSchema = z.object({
  errorContext: errorContextSchema,
  deviceContext: deviceContextSchema,
  reqContext: reqContextSchema.optional(),
  timestamp: z.iso.datetime(),
}) satisfies z.ZodType<ErrorPayload>;

export type ErrorPayloadDto = z.infer<typeof errorPayloadSchema>;
