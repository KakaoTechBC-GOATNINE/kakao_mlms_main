# 1단계: 빌드 단계
FROM node:16 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: Nginx로 서빙
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

ENV TZ=Asia/Seoul

CMD ["nginx", "-g", "daemon off;"]
