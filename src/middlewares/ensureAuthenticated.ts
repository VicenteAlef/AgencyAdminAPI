// src/middlewares/ensureAuthenticated.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/client.js";

interface TokenPayload {
  id: string;
  role: Role;
  iat: number;
  exp: number;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token JWT não informado." });
  }

  // O formato esperado é "Bearer <token>"
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const { id, role } = decoded as TokenPayload;

    // Injetando os dados do usuário na requisição
    req.user = {
      id,
      role,
    };

    return next(); // Tudo certo, pode seguir para o Controller!
  } catch (error) {
    return res.status(401).json({ error: "Token JWT inválido ou expirado." });
  }
}
