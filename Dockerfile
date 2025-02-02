FROM node:20-alpine

# Set the working directory in the container
WORKDIR /build

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Set NODE_ENV to development to install devDependencies
ENV NODE_ENV=development
RUN npm install

# Copy all files into the container
COPY . .

# Expose the port your application uses (adjust if necessary)
EXPOSE 3000

# Specify the default command to directly use tsx
CMD ["npx", "tsx", "watch", "--env-file", ".env", "index.ts"]

