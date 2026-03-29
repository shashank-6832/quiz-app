# ── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev

# ── Stage 2: Production image ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user for security
RUN addgroup -S quizgroup && adduser -S quizuser -G quizgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R quizuser:quizgroup /app
USER quizuser

EXPOSE 5000
CMD ["node", "index.js"]
