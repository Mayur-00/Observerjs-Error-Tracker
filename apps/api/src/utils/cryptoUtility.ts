import crypto from "node:crypto";

export const GenerateApikey = (projectId:string) => {
  const secret = crypto.randomBytes(16).toString("hex");
  const rawkey = `pk_live_${secret}_${projectId}`;
  const preview = `pk_live_${secret.slice(0, 5)}`
  return {rawkey, preview};
};

export function hashRawApikey(rawkey: string) {
  return crypto.createHash("sha256").update(rawkey).digest("hex");
}
