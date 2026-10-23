import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "os";
import { IDeviceContext } from "./types.js";

export function sanitizeBody(body: any) {
  if (!body || typeof body !== "object") return body;
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "authorization",
    "creditCard",
  ];

  const sanitized = { ...body };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[FILTERED]";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }
  return sanitized;
}

export interface StackLocation {
  file: string;
  line: number;
  column: number;
}

// matches "at fn (<loc>:line:col)" and "at <loc>:line:col"
const FRAME_RE = /^\s*at (?:.+? \()?(.+?):(\d+):(\d+)\)?\s*$/;

export function extractErrorLocation(
  stack?: string,
): StackLocation | undefined {
  if (!stack) return undefined;

  for (const raw of stack.split("\n")) {
    const m = FRAME_RE.exec(raw);
    if (!m) continue; // message lines, "at <anonymous>", etc.

    let file = m[1];

    // skip Node internals and dependencies; we want the first *user* frame
    if (file.startsWith("node:") || file.includes("node_modules")) continue;

    // ESM frames are file:// URLs; CJS frames are plain paths
    if (file.startsWith("file://")) {
      try {
        file = fileURLToPath(file); // also handles file:///C:/... on Windows
      } catch {
        continue;
      }
    }

    // relative to the app root: stable across machines, doesn't leak home dirs
    file = path.relative(process.cwd(), file).split(path.sep).join("/");

    return { file, line: Number(m[2]), column: Number(m[3]) };
  }
  return undefined; // never throw from inside the error reporter
}

export function getDeviceContext(enviroment: string): IDeviceContext {
  return {
    os: os.platform(),
    osVersion: os.release(),
    environment: enviroment,
    platform: "NodeJs",
    platformVersion: process.version,
  };
}
