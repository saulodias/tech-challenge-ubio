# Use the official Node.js 20 image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the TypeScript compiler
RUN npm run compile

# Expose the port your app runs on
EXPOSE 8080

# Command to run your application
CMD ["npm", "start"]
