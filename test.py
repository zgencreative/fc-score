import json
from datetime import datetime, timedelta
import pandas as pd

# Fungsi untuk mengimpor file JSON
def load_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

# Fungsi untuk menghitung minggu berdasarkan Sabtu sampai Jumat
def get_week_start(date):
    # Mendapatkan hari Sabtu terdekat (atau hari yang sama jika sudah Sabtu)
    days_to_saturday = (date.weekday() - 5) % 7
    return date - timedelta(days=days_to_saturday)

# Mengimpor data JSON
file_path = 'data.json'  # Ganti dengan path ke file JSON Anda
data = load_json_file(file_path)

# Memproses data events
events = data['data']['Events']

# Konversi waktu 'time_start' ke dalam format datetime
for event in events:
    event['time_start'] = datetime.strptime(str(event['time_start']), "%Y%m%d%H%M%S")

# Kelompokkan pertandingan berdasarkan minggu
weeks = []
for event in events:
    start_of_week = get_week_start(event['time_start'])
    weeks.append(start_of_week)

# Menambahkan informasi minggu ke dalam data pertandingan
for i, event in enumerate(events):
    event['week_start'] = weeks[i]

# Membuat DataFrame untuk menampilkan hasilnya
df = pd.DataFrame(events)

# Menghitung jumlah minggu yang terdeteksi
unique_weeks = df['week_start'].nunique()
print(f"Jumlah minggu yang terdeteksi: {unique_weeks}")

# Menampilkan DataFrame yang berisi hasil pengelompokkan minggu
print(df.head())  # Menampilkan 5 baris pertama
