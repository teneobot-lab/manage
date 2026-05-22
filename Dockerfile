# Enterprise Multi-stage Build Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
copy package.json ./

# Install dependecies
RUN npm install

# Copy application files
copy . .

# Generate Prisma Client (If database URL is configured, or can use mock mode)
# RUN npx prisma generate

# Build Frontend and Bundle Backend Server
RUN npm run build

# --- Production Runner Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
# If we have any shared data folder, create it
RUN mkdir -p /app/data

# Install production dependencies only to minimize image size
RUN npm install --only=production

EXPOSE 3000

# Run using the bundled production file
CMD ["npm", "start"]
