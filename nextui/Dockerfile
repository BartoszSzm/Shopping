FROM node:20-bullseye

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]