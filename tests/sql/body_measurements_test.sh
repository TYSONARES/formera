#!/usr/bin/env bash
# 0019 body_measurements RLS'ini bos bir Postgres'te dogrular.
set -euo pipefail
PORT="${PGPORT:-55432}"; HOST="${PGHOST:-/tmp}"; DB=formera_bm_test
HERE="$(cd "$(dirname "$0")" && pwd)"; MIG="$HERE/../../supabase/migrations"
P(){ psql -h "$HOST" -p "$PORT" -U postgres -q -v ON_ERROR_STOP=1 "$@"; }
psql -h "$HOST" -p "$PORT" -U postgres -q -c "drop database if exists $DB;" -c "create database $DB;"
P -d "$DB" -f "$HERE/00_supabase_shim.sql"
P -d "$DB" -f "$HERE/00b_storage_shim.sql"
P -d "$DB" -f "$HERE/00c_pgnet_vault_shim.sql"
for f in "$MIG"/0*.sql; do P -d "$DB" -f "$f" >/dev/null; done
P -d "$DB" -f "$HERE/attack_seed.sql"
echo "senaryolar:"
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -t -A -f "$HERE/body_measurements.sql" 2>&1 | grep -vE "^(INSERT|NOTICE)" | sed 's/^/  /'
