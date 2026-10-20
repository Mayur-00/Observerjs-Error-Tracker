
export function sanitizeBody(body: any) {
  if (!body || typeof body !== "object") return body;
  const sensitiveKeys = ["password", "token", "secret", "authorization", "creditCard"];

  const sanitized = { ...body };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = "[FILTERED]";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }
  return sanitized;
};

export function extractErrorLocationFromStackTrace(stack:string){
    return stack.split(' at ')[1].split('///')[1];
}