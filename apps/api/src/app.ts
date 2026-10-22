import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth, userRateLimiter } from "./config";
import { handleError } from "./middlewares";
import { projectRoutes } from "./modules/project";

export const app = express();

app.use(cors({
  origin:process.env.FRONTEND_URL! ||"http://localhost:3000",
  credentials:true
}));

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ limit: '16kb', extended: true }));

app.set('trust proxy', 1);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/v1/user', userRateLimiter)

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use('/api/v1/user/project', projectRoutes);



app.use(handleError);