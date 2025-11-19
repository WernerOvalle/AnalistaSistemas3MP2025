# Dockerfile para Frontend React + Vite
FROM node:20-alpine

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Instalar dependencias
RUN pnpm install

# Copiar el resto del código
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Comando para desarrollo con hot reload
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
