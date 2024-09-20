# Stage 1: Build the application
FROM node:18-bullseye-slim as builder

# Set environment variables
ENV NODE_ENV=development

# Create app directory inside the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install Yarn globally only if it isn't already installed, and force the installation if needed
RUN if ! command -v yarn >/dev/null 2>&1; then npm install -g yarn --force; fi

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the application code
COPY ./tsconfig.json ./tsconfig.build.json ./
COPY ./src ./src

# Build the TypeScript files
RUN yarn build

# Stage 2: Run the application
FROM node:18-bullseye-slim as runner

# Set environment variables
ENV NODE_ENV=production

# Working directory for the app
WORKDIR /usr/src/app

# Copy built app from the builder stage
COPY --from=builder /usr/src/app /usr/src/app

# Expose application port
EXPOSE 3000

# Run migrations before starting the app
CMD yarn run migration:run && yarn run start:prod
