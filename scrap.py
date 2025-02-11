import requests
from bs4 import BeautifulSoup as BS

url = "https://mansionsportsfc.com/tag/manchester-united"
res = requests.get(url)
scrap = BS(res.text, 'html.parser').find_all('div', class_='col-md-4 mb-2')
for i in scrap:
    print(f"Title : {i.find('h4').text}")
    print(f"Gambar : {i.find('img').get('data-src')}")
    print(f"Tanggal : {i.find('small').text}")
    print(f"URL : {i.find('a').get('href')}")
    print()