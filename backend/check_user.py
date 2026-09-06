import sqlite3
conn = sqlite3.connect('internera_local_v2.db')
cursor = conn.cursor()
cursor.execute("SELECT id, email, password_hash, is_active FROM users WHERE email='lina.omar@student.yu.edu.jo'")
print(cursor.fetchone())
