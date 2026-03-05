// src/services/AuthService.ts
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { generateVerificationCode } from "../utils/generateCode.js";

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class AuthService {
  // ETAPA 1: Validar senha e enviar código
  async initiateLogin(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive || user.deletedAt) {
      throw new Error("Credenciais inválidas ou usuário inativo.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas.");
    }

    // Gerar código e definir expiração (ex: 10 minutos)
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Usamos upsert para criar um novo código ou atualizar se o usuário tentar logar de novo
    await prisma.verificationCode.upsert({
      where: { userId: user.id },
      update: { code, expiresAt },
      create: { code, expiresAt, userId: user.id },
    });

    // Disparar o e-mail
    await transporter.sendMail({
      from: '"Painel da Agência" <nao-responda@agencia.com.br>',
      to: user.email,
      subject: "Seu código de acesso",
      text: `Olá ${user.name}, seu código de verificação é: ${code}. Ele expira em 10 minutos.`,
    });

    return { message: "Código enviado para o e-mail cadastrado." };
  }

  // ETAPA 2: Validar o código e gerar o JWT
  async verifyCode(email: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { verificationCode: true },
    });

    if (!user || !user.verificationCode) {
      throw new Error("Usuário não encontrado ou código não gerado.");
    }

    const { verificationCode } = user;

    // Verificar se o código bate e se não expirou
    if (verificationCode.code !== code) {
      throw new Error("Código inválido.");
    }

    if (new Date() > verificationCode.expiresAt) {
      throw new Error("Código expirado. Por favor, faça login novamente.");
    }

    // Se chegou aqui, o código é válido. Vamos apagá-lo para não ser reusado.
    await prisma.verificationCode.delete({ where: { userId: user.id } });

    // Atualizar status para online
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true },
    });

    // Gerar o JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }, // Token expira em 1 dia
    );

    // Retornar os dados do usuário (sem a senha, claro) e o token
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
