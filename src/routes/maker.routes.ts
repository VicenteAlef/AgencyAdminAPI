// src/routes/maker.routes.ts
import { Router } from "express";
import { MakerController } from "../controllers/MakerController.js";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated.js";
import { ensureAdmin } from "../middlewares/ensureAdmin.js";

const makerRoutes = Router();
const makerController = new MakerController();

// Todas as rotas de fabricante exigem autenticação
makerRoutes.use(ensureAuthenticated);

// Listagem permitida para todos os usuários logados (User e Admin)
makerRoutes.get("/", makerController.list);

// Criação, edição e exclusão restritas apenas para Admins
makerRoutes.post("/", ensureAdmin, makerController.create);
makerRoutes.put("/:id", ensureAdmin, makerController.update);
makerRoutes.delete("/:id", ensureAdmin, makerController.delete);

export { makerRoutes };
