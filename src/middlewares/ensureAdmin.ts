// src/middlewares/ensureAdmin.ts
import type { Request, Response, NextFunction } from "express";

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  // Esse middleware sempre deve ser chamado DEPOIS do ensureAuthenticated
  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  if (req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({
        error:
          "Acesso negado. Apenas administradores podem realizar esta ação.",
      });
  }

  return next();
}
