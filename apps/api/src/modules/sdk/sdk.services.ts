import { eq } from "drizzle-orm";
import { DB } from "../../db";
import { Logger } from "winston";
import { apiKey, project } from "../../db/schema";


export class SdkService{
    constructor(private dbClient:DB , private logger:Logger){};

  
}