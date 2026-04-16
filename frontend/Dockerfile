FROM node:20.20.0-slim

WORKDIR /app

# Xóa cache để đảm bảo không dính bản build cũ của thư viện 3D
RUN npm cache clean --force

COPY package*.json ./

# Cài đặt lại từ đầu trong môi trường Node 20
RUN npm install

# Copy toàn bộ source code (bao gồm file index.html đã fix)
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]