# Use official Node.js image with Debian (works great on Render)
FROM node:18-slim

# Install ImageMagick tool
RUN apt-get update && apt-get install -y \
    imagemagick \
    ghostscript \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*


# Copy custom policy.xml
COPY ./policy.xml /etc/ImageMagick-6/policy.xml

# Set working directory
WORKDIR /app

# Copy only package files first for better Docker cache
COPY package*.json ./

# Install dependencies including devDependencies
RUN npm install --include=dev

# Copy rest of the app
COPY . .

# Expose your app's port
EXPOSE 3000

# Use a non-root user (optional but good practice)
# RUN useradd -m appuser
# USER appuser

# Start app
CMD ["npm", "run", "prod"]