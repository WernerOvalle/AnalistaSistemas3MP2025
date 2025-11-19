# Dockerfile para Backend Node.js
FROM node:20-alpine

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo con hot reload
CMD ["pnpm", "run", "dev"]
