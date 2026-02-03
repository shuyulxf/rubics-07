FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port for development server
EXPOSE 5173
EXPOSE 9000

# Start with bash shell for development environment
CMD ["/bin/bash"]