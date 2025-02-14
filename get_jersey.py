from flask import Flask, render_template, request, redirect, url_for
import os
import requests

app = Flask(__name__)

folder_path = 'static/img/jersey/'

@app.route('/', methods=['GET', 'POST'])
def index():
    # Mendapatkan semua file dalam folder (hanya file, bukan folder)
    files = [f for f in os.listdir(folder_path) 
         if os.path.isfile(os.path.join(folder_path, f)) and not f.split('.')[0].isdigit()]

    if request.method == 'POST':
        # Mengambil input nama akhir
        new_name = request.form['nama_akhir']
        file_to_rename = request.form['file_name']
        
        # Melakukan rename file
        if new_name:
            file_path = os.path.join(folder_path, file_to_rename)
            new_file_path = os.path.join(folder_path, f"{new_name}.svg")
            os.rename(file_path, new_file_path)

            # Mengambil gambar baru setelah perubahan nama
            return redirect(url_for('index'))

    return render_template('index.html', files=files)

def get_team_name(query):
    url = f"https://prod-cdn-search-api.lsmedia1.com/api/v2/search/soccer?query={query}&limit=1&locale=ID&teams=true&countryCode=ID"
    res = requests.get(url).json()
    return res['Teams'][0]['Nm'].lower()

@app.route('/image/<filename>')
def image(filename):
    return f'<img src="/static/img/jersey/{filename}" alt="{filename}">'

if __name__ == '__main__':
    app.run(host="192.168.1.38", port=5000, debug=True)
