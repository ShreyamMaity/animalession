#!/bin/sh
set -e

# Build DATABASE_URL from individual components with proper URL encoding
# This avoids special characters in passwords breaking the connection string
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL=$(node -e "
    const u = new URL('postgresql://${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-animalession_store}');
    u.username = process.env.DB_USER || 'postgres';
    u.password = process.env.DB_PASSWORD || '';
    console.log(u.toString());
  ")
  echo "DATABASE_URL constructed from DB_* env vars"
fi

echo "Running Prisma migrations..."
node node_modules/prisma/build/index.js migrate deploy

echo "Starting application..."
exec "$@"
