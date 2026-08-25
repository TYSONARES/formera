#!/usr/bin/env bash
# Migration'lari sirayla bos bir Postgres'e uygular ve RLS senaryolarini calistirir.
# Gereksinim: yerel PostgreSQL 14+ (Supabase'e baglanmaz, canli veriye dokunmaz).
set -euo pipefail
PORT="${PGPORT:-55432}"; HOST="${PGHOST:-/tmp}"; DB=formera_rls_test
HERE="$(cd "$(dirname "$0")" && pwd)"; MIG="$HERE/../../supabase/migrations"

psql -h "$HOST" -p "$PORT" -U postgres -q -c "drop database if exists $DB;" -c "create database $DB;"
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -q -v ON_ERROR_STOP=1 -f "$HERE/00_supabase_shim.sql"
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -q -v ON_ERROR_STOP=1 -f "$HERE/00b_storage_shim.sql"

echo "migration'lar sirayla uygulaniyor:"
for f in "$MIG"/0*.sql; do
  if psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -q -v ON_ERROR_STOP=1 -f "$f" >/dev/null 2>&1; then
    echo "  [OK  ] $(basename "$f")"
  else
    echo "  [HATA] $(basename "$f")"; exit 1
  fi
done

psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -q -v ON_ERROR_STOP=1 -f "$HERE/01_seed.sql"
echo; echo "RLS senaryolari:"
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -t -A -f "$HERE/02_cases.sql" 2>&1 | sed 's/^/  /'
