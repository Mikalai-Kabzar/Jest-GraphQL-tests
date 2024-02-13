FROM node:latest
# Create app directory
WORKDIR /app
# Copy package.json and package-lock.json using a wildcard
COPY package*.json ./
# Install app dependencies
RUN npm install
# Bundle app source
COPY . .
EXPOSE 4001
CMD ["npm", "test"]