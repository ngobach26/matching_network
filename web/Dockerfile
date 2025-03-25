# Use official Node.js image
FROM node:20-alpine

WORKDIR /app

# Install dependencies with relaxed peer checks
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy rest of the project
COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
