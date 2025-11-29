#!/bin/bash
# Pass environment variables to Apache
echo "export DB_HOST='$DB_HOST'" >> /etc/apache2/envvars
echo "export DB_USER='$DB_USER'" >> /etc/apache2/envvars
echo "export DB_PASSWORD='$DB_PASSWORD'" >> /etc/apache2/envvars
echo "export DB_NAME='$DB_NAME'" >> /etc/apache2/envvars
echo "export DB_PORT='$DB_PORT'" >> /etc/apache2/envvars

# Start Apache
apache2-foreground
