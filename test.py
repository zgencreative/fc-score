import jwt

# JWT token yang ingin didekode
token = "eyJpdiI6InlVOWp5YzBjZy91WEswWXgwS052Q3c9PSIsInZhbHVlIjoia3o3enNvamk2aG41ckN5cjZCOUdheElSTEY5bHNoQTVXSm96aCt6RzVZdmpUYURTbjZ0NkQ5MHltK01OZStPUlZDRHM5R29jdjFFSXEvU3pCdXZ1U0cva2JQWFZYUWZYdEdWNVlJWHM5ek9EdVBqRW1sR0dwcEQwWm9LYWhaOW0iLCJtYWMiOiJhYTRmMzQ1NjBkY2Q1YWViNTdmZThmMWY5NzE1MDliODMyZjdhN2EzOGM4MzNiMzc3MjM0N2YzMGIxMjM4YWY0IiwidGFnIjoiIn0%3D"

# Secret key atau public key yang digunakan untuk menandatangani token
secret_key = "yb6CwO63qdQ5Vn21a9QcoNdSPHcKq3tMM7DtoPyfIfpElQaG9QuAoTdUzuahM40W"  # Ganti dengan secret key yang digunakan di Laravel

try:
    # Mendekode token dan memverifikasi tanda tangan menggunakan secret key
    decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"], leeway=60)  # Sesuaikan algoritma dengan yang digunakan

    print("Decoded Token:", decoded_token)
except jwt.ExpiredSignatureError:
    print("Token has expired")
except jwt.InvalidTokenError:
    print("Invalid Token")
