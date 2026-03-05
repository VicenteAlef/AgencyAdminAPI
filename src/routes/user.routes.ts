// src/routes/user.routes.ts
import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";
import { ensureAdmin } from "../middlewares/ensureAdmin.js";

const userRoutes = Router();
const userController = new UserController();

// Todas as rotas de usuários requerem autenticação e privilégios de Admin
userRoutes.use(ensureAuthenticated, ensureAdmin);

userRoutes.post("/", userController.create);
userRoutes.get("/", userController.list);
userRoutes.get("/:id", userController.getById);
userRoutes.put("/:id", userController.update);
userRoutes.delete("/:id", userController.delete);

export { userRoutes };
