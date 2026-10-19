import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth";
import dotenv from 'dotenv'
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin:process.env.FRONTEND_URL! ||"http://localhost:3000",
  credentials:true
}));
app.use(express.json());
app.all("/api/auth/{*any}", toNodeHandler(auth));
app.get("/api/health", (req, res) => {
  console.log("an request come, on:", req.url)
  res.json({ status: "ok", message: "Express API is running smoothly!" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});