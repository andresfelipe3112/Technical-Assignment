# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app
# Copy the entire app from the builder stage
COPY --from=builder /app .
# Install production dependencies to a separate layer
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/main.js"]