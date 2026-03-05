// src/utils/generateCode.ts
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Gera o codigo de 6 dig para autenticação 2FA
