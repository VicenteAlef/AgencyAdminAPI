// src/services/MakerService.ts
import { prisma } from "../config/prisma.js";

export class MakerService {
  // Criar Fabricante
  async create(data: { name: string }) {
    // Verifica se já existe um fabricante com esse nome (evita duplicidade)
    const makerExists = await prisma.maker.findUnique({
      where: { name: data.name },
    });

    if (makerExists) {
      // Se ele existir mas estiver "excluído" (soft delete), podemos apenas restaurá-lo
      if (makerExists.deletedAt !== null) {
        return await prisma.maker.update({
          where: { id: makerExists.id },
          data: { deletedAt: null },
        });
      }
      throw new Error("Este fabricante já está cadastrado.");
    }

    const maker = await prisma.maker.create({
      data: { name: data.name },
    });

    return maker;
  }

  // Listar Fabricantes (Sem paginação, pois alimentará um select)
  async list() {
    const makers = await prisma.maker.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" }, // Ordem alfabética para facilitar na UI
    });

    return makers;
  }

  // Atualizar Fabricante
  async update(id: string, data: { name: string }) {
    const maker = await prisma.maker.findFirst({
      where: { id, deletedAt: null },
    });
    if (!maker) throw new Error("Fabricante não encontrado.");

    // Verifica se o novo nome já pertence a outro registro
    const nameInUse = await prisma.maker.findUnique({
      where: { name: data.name },
    });
    if (nameInUse && nameInUse.id !== id) {
      throw new Error("Já existe outro fabricante com este nome.");
    }

    const updatedMaker = await prisma.maker.update({
      where: { id },
      data: { name: data.name },
    });

    return updatedMaker;
  }

  // Excluir Fabricante (Soft Delete)
  async delete(id: string) {
    const maker = await prisma.maker.findFirst({
      where: { id, deletedAt: null },
    });
    if (!maker) throw new Error("Fabricante não encontrado.");

    // Regra de segurança opcional: verificar se existem veículos vinculados antes de excluir
    const linkedVehicles = await prisma.vehicle.count({
      where: { makerId: id, deletedAt: null },
    });

    if (linkedVehicles > 0) {
      throw new Error(
        "Não é possível excluir este fabricante, pois existem veículos vinculados a ele.",
      );
    }

    await prisma.maker.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: "Fabricante excluído com sucesso." };
  }
}
