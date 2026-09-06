import sqlite3
conn = sqlite3.connect('internera_local_v2.db')
cursor = conn.cursor()
cursor.execute("SELECT failed_attempts FROM users WHERE email='lina.omar@student.yu.edu.jo'")
print(cursor.fetchone())
