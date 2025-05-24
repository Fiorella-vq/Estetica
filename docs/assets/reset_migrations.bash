rm -R -f ./migrations &&
pipenv run init &&
psql -U postgres -c "DROP DATABASE IF EXISTS flor";
psql -U postgres -c "CREATE DATABASE flor";
psql -U postgres -c "CREATE EXTENSION unaccent" -d flor;
pipenv run migrate &&
pipenv run upgrade
