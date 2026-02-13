FROM postgres:18.2

COPY db.sql /docker-entrypoint-initdb.d/10-init.sql
