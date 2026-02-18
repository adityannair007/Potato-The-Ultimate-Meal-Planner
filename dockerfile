FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the Next.js files
COPY . .

# Next.js defaults to port 3000
EXPOSE 3000

# Run the Next.js dev server
CMD ["npm", "run", "dev"]