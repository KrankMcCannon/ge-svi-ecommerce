# Stage 1: Build the microservice
FROM node:18-bullseye-slim as builder

# Set environment variables
ENV NODE_ENV=development

# Create app directory inside the container for the microservice
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install Yarn globally only if it isn't already installed, and force the installation if needed
RUN if ! command -v yarn >/dev/null 2>&1; then npm install -g yarn --force; fi

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the microservice directory
COPY ./tsconfig.json ./tsconfig.build.json ./
COPY ./microservice ./microservice

# Stage 2: Run the microservice
FROM node:18-bullseye-slim as runner

# Set environment variables
ENV NODE_ENV=production

# Working directory for the microservice
WORKDIR /usr/src/app

# Copy built microservice from the builder stage
COPY --from=builder /usr/src/app /usr/src/app

# Start the microservice
CMD ["yarn", "run", "start:microservice"]