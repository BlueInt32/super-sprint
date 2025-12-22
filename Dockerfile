# Use Node.js LTS version
FROM node:25-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY app/ ./

# Build the JavaScript bundle
RUN npm run build

# Start the application
CMD ["npm", "run",  "dev"]
