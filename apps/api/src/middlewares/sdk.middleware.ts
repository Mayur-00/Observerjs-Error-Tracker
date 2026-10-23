import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { hashRawApikey } from "../utils";
import { apiKey } from "../db/schema";



export const verifykey = async (req: Request, res: Response, next: NextFunction) => {

    // extract the raw Apikey from the authorization header
  const rawkey = req.header("Authorization")?.replace("Bearer ", "");
  // if there is no apikey in auth header or raw ApiKey doesn't start with the prefix return 401 
  if (!rawkey || !rawkey.startsWith("pk_live_")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid Authorization header.",
    });
  }
 // hash the raw ApiKey to query the db
  const hash = hashRawApikey(rawkey);

  // select specific rows from the apiKey table and, query with the conditions like: match the apikey field and isActive field should be true
  const [dbResponse] = await db
    .select({
      projectId: apiKey.projectId,
    })
    .from(apiKey)
    .where(and(eq(apiKey.apiKey, hash), eq(apiKey.isActive, true)));

    // if the query return undefined return 401 with message 
  if (dbResponse === undefined) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid Api Key",
    });
  }

  // set the db response to the sdkSession field in the req object to be used in the controller
  req.sdkSession = dbResponse;
  next();
};

