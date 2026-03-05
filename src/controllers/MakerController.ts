// src/controllers/MakerController.ts
import type { Request, Response } from "express";
import { MakerService } from "../services/MakerService.js";

const makerService = new MakerService();

export class MakerController {
  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ error: "O nome do fabricante é obrigatório." });

      const maker = await makerService.create({ name });
      return res.status(201).json(maker);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const makers = await makerService.list();
      return res.status(200).json(makers);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ error: "O nome do fabricante é obrigatório." });

      const updatedMaker = await makerService.update(id, { name });
      return res.status(200).json(updatedMaker);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const response = await makerService.delete(id);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
