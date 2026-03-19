# FROM node:20

# WORKDIR /nexusChat

# COPY . .

# RUN cd backend && npm install

# WORKDIR /nexusChat/backend

# EXPOSE 6756


# CMD ["npm","test"]

FROM node:20-alpine AS deps
WORKDIR /app

COPY /backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app/backend

RUN addgroup -S nexus && adduser -S nexus -G nexus

COPY --from=deps /app/backend/node_modules ./node_modules
COPY backend ./
COPY frontend ../frontend

RUN chown -R nexus:nexus /app
USER nexus

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/auth/verify-token || exit 1

CMD ["node", "src/server.js"]
