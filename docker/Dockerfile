# Use Node.js 14 Alpine as the base image for building
FROM node:14-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Start a new stage for the production image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the built assets from the build stage
COPY --from=build /app/dist ./dist

# Copy node_modules from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Prune the node_modules to include only production dependencies
RUN npm prune --production

# Expose port 3000 for the application
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/server.js"]