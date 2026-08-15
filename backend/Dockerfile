FROM php:8.3-cli-alpine

# Install system dependencies & required PHP extensions for Laravel
RUN apk add --no-cache \
    curl \
    git \
    unzip \
    libpng-dev \
    libxml2-dev \
    oniguruma-dev \
    libzip-dev \
    zip

RUN docker-php-ext-install pdo_mysql mbstring bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .

# Ensure storage & bootstrap permissions
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "composer install --no-interaction --prefer-dist && php artisan key:generate --force && php artisan storage:link --force && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
