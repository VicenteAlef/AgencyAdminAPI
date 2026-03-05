import express from "express";
import cors from "cors";
import { router } from "./routes/router.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use(router);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export { app };
