import urllib.request
import urllib.error

req = urllib.request.Request(
    'http://127.0.0.1:8000/auth/login',
    data=b'{"email": "lina.omar@student.yu.edu.jo", "password": "dania2004"}',
    headers={'Origin': 'http://192.168.154.1:3001', 'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req)
    print("Status:", res.status)
    print("Headers:", res.headers)
    print("Body:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Status:", e.status)
    print("Headers:", e.headers)
    print("Body:", e.read().decode())
