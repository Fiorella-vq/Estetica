# test_db.py
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()  # carga las variables del .env

# Para psycopg2 puro, separa los parámetros:
try:
    conn = psycopg2.connect(
        dbname="flor",
        user="postgres",
        password="Fiorella2412",
        host="localhost",
        port=5432
    )
    print("✅ Conexión exitosa")
    conn.close()
except Exception as e:
    print("❌ Error:", e)
