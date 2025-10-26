# Dockerfile para BFF API Gateway

FROM node:20-slim

# Adiciona metadata
LABEL maintainer="Equipe de Desenvolvimento"
LABEL description="BFF API Gateway - Backend for Frontend"

# Define diretório de trabalho
WORKDIR /app

# Copia package.json
COPY package.json ./

# Instala dependências
RUN npm install --omit=dev && \
    npm cache clean --force

# Copia código da aplicação
COPY . .

# Cria usuário não-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

# Muda para usuário não-root
USER nodejs

# Expõe a porta da aplicação
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
