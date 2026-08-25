#!/usr/bin/env bash
# Saldirgan RLS denetimi: iki studyo + dort rolle capraz erisim/yukseltme
# senaryolari. Bos bir yerel Postgres'e migration'lari uygular, sonra
# saldirilari calistirir. Supabase'e baglanmaz, canli veriye dokunmaz.
set -euo pipefail
PORT="${PGPORT:-55432}"; HOST="${PGHOST:-/tmp}"; DB=formera_attack
HERE="$(cd "$(dirname "$0")" && pwd)"; MIG="$HERE/../../supabase/migrations"
P(){ psql -h "$HOST" -p "$PORT" -U postgres -q -v ON_ERROR_STOP=1 "$@"; }

psql -h "$HOST" -p "$PORT" -U postgres -q -c "drop database if exists $DB;" -c "create database $DB;"
P -d "$DB" -f "$HERE/00_supabase_shim.sql"
P -d "$DB" -f "$HERE/00b_storage_shim.sql"
for f in "$MIG"/0*.sql; do P -d "$DB" -f "$f" >/dev/null; done
P -d "$DB" -f "$HERE/attack_seed.sql"
echo "=== capraz stüdyo / okuma-yazma ==="
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -f "$HERE/attack_rls.sql" 2>&1 | grep -vE '^(BEGIN|SET|ROLLBACK|Output)'
echo; echo "=== yetki yükseltme ==="
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -f "$HERE/attack_rls_privilege.sql" 2>&1 | grep -vE '^(BEGIN|SET|ROLLBACK|Output)'
echo; echo "=== storage / abonelik / landing / admin ==="
psql -h "$HOST" -p "$PORT" -U postgres -d "$DB" -f "$HERE/attack_storage_billing.sql" 2>&1 | grep -vE '^(BEGIN|SET|ROLLBACK|Output)'
