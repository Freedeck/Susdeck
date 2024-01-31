FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm i
ENV PORT=6161
CMD ["node", "scripts/deploy.cjs"]
EXPOSE 6161