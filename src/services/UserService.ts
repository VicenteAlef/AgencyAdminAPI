// src/services/UserService.ts
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client.js";

export class UserService {
  // Criar Usuário
  async create(data: {
    name: string;
    email: string;
    password?: string;
    role?: Role;
    isActive?: boolean;
  }) {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    // Se o admin não informar senha na criação, pode-se gerar uma padrão ou exigir
    const passwordToHash = data.password || "123456";
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "USER",
        isActive: data.isActive ?? true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Listar Usuários (Paginação de 10 em 10)
  async list(page: number = 1) {
    const take = 10;
    const skip = (page - 1) * take;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null }, // Ignora os excluídos logicamente
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isOnline: true,
          isActive: true,
          profilePhoto: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  // Buscar Usuário por ID
  async getById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOnline: true,
        isActive: true,
        profilePhoto: true,
      },
    });

    if (!user) throw new Error("Usuário não encontrado.");
    return user;
  }

  // Atualizar Usuário
  async update(
    id: string,
    data: { name?: string; email?: string; role?: Role; isActive?: boolean },
  ) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new Error("Usuário não encontrado.");

    if (data.email && data.email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists)
        throw new Error("Este e-mail já está em uso por outro usuário.");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updatedUser;
  }

  // Excluir Usuário (Soft Delete)
  async delete(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) throw new Error("Usuário não encontrado.");

    // Preenche o deletedAt ao invés de apagar a linha
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: "Usuário excluído com sucesso." };
  }
}
