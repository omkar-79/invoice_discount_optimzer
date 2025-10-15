#!/bin/sh
set -e

# Run Prisma migrations (safe in prod)
if [ -f ./prisma/schema.prisma ]; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
fi

echo "Starting API..."
exec node dist/server.js


