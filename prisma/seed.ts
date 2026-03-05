// prisma/seed.ts
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Criar o Usuário Admin Inicial
  const adminEmail = "ildehislan@gmail.com"; // Você pode mudar depois
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("123456", 10); // Senha padrão inicial

    await prisma.user.create({
      data: {
        name: "Administrador Master",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });
    console.log("✅ Usuário Admin criado com sucesso!");
  } else {
    console.log("⚠️ Usuário Admin já existe. Pulando etapa.");
  }

  // 2. Criar as Configurações Iniciais da Agência (para o Nodemailer funcionar depois)
  const settingsCount = await prisma.agencySettings.count();

  if (settingsCount === 0) {
    await prisma.agencySettings.create({
      data: {
        contactEmail: "ildehislan@gmail.com", // E-mail que receberá as mensagens do site
      },
    });
    console.log("✅ Configurações da agência criadas com sucesso!");
  } else {
    console.log("⚠️ Configurações da agência já existem. Pulando etapa.");
  }

  console.log("🌲 Seed finalizado!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
