FROM php:8.2-apache

# Installer les extensions PHP nécessaires à WordPress (incluant mysqli)
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev zip unzip libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mysqli zip mbstring gd

# Active le module Apache mod_rewrite pour les permaliens WordPress
RUN a2enmod rewrite

# Copie tous les fichiers dans le dossier web
COPY . /var/www/html/

# Assurer que les fichiers sont bien accessibles par Apache
RUN chown -R www-data:www-data /var/www/html
