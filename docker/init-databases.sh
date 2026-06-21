#!/bin/bash
# Creates the two databases needed by the stack.
# This script is mounted into /docker-entrypoint-initdb.d/ and runs
# automatically when the PostgreSQL container is first initialized.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE hotel;
    CREATE DATABASE beach;
EOSQL
