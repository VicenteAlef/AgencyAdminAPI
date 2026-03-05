// src/controllers/UserController.ts
import type { Request, Response } from "express";
import { UserService } from "../services/UserService.js";

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await userService.list(page);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Id do usuário não informado" });
      }
      const user = await userService.getById(id);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Id do usuário não informado" });
      }
      const updatedUser = await userService.update(id, req.body);
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Id do usuário não informado" });
      }

      // Impede que o admin logado exclua a si mesmo
      if (req.user.id === id) {
        return res
          .status(403)
          .json({ error: "Você não pode excluir sua própria conta." });
      }

      const response = await userService.delete(id);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
