import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth, userRateLimiter } from "./config";
import { handleError, requireAuth } from "./middlewares";
import { projectRoutes } from "./modules/project";
import { errorRoutes } from "./modules/error";
import { sdkRoutes } from "./modules/sdk";

export const app = express();

app.use(cors({
  origin:process.env.FRONTEND_URL!,
  credentials:true
}));

app.use(express.json({ limit: '100kb' }));


app.set('trust proxy', 1);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/v1/user', userRateLimiter, requireAuth)

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use('/api/v1/user/project', projectRoutes);
app.use('/api/v1/user/error', errorRoutes);
app.use('/api/v1/sdk', sdkRoutes);



app.use(handleError);