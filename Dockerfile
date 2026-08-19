# Stage 1: Build application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build application bundle
RUN npm run build

# Stage 2: Serve static bundle via Nginx
FROM nginx:alpine AS runner

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
