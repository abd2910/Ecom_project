# Use stable Node.js version
FROM node

# Set application root directory
WORKDIR /testapp

# Copy only package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all remaining source code
COPY . .

# Expose backend port (change if your app uses another)
EXPOSE 8000

# Start the application
CMD ["npm", "run", "dev"]

