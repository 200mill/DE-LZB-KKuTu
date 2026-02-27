#!/usr/bin/env bash
set -euo pipefail

PIDS=$(pgrep -f "node lib/(Game|Web)/cluster\.js" || true)

if [ -z "${PIDS}" ]; then
  echo "No running KKuTu cluster process found."
  exit 0
fi

echo "Stopping KKuTu cluster processes: ${PIDS}"
kill ${PIDS} || true

sleep 1
REMAINING=$(pgrep -f "node lib/(Game|Web)/cluster\.js" || true)

if [ -n "${REMAINING}" ]; then
  echo "Force stopping remaining processes: ${REMAINING}"
  kill -9 ${REMAINING} || true
fi

echo "KKuTu server stopped."
