FROM node:16-alpine
WORKDIR /app
COPY ./package.json ./
# COPY ./node_modules ./
RUN npm cache clean --force
RUN npm install --no-package-lock
COPY ./dist ./dist
CMD ["npm", "run", "start:prod"]
EXPOSE 3000