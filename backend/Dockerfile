FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (trùng với port backend của bạn)
EXPOSE 8082

# Chạy backend
CMD ["npm", "start"]
