FROM node:22.18.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install -g serve vite

ENV VITE_API_BASE_URL=/api/Agents

ENV VITE_API_TARGET=https://brm-partners.britam.com

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
