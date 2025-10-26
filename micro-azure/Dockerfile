# Dockerfile para Microserviço de Usuários (Azure SQL)

FROM node:20-slim

LABEL description="Microserviço de Usuários com Azure SQL"

WORKDIR /app

# Copia package.json
COPY package.json ./

# Instala dependências
RUN npm install --omit=dev && npm cache clean --force

# Copia código
COPY . .

# Cria usuário não-root
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENV NODE_ENV=production \
    PORT=3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
