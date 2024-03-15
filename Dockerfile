FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm i
ENV PORT=6161
CMD ["npm", "run", "server"]
EXPOSE 6161