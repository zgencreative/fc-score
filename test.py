import requests

url = "https://mansionsportsfc.com/api/login"

data = {'email':'user@mail.com',
        'password':'1234567'}

res = requests.post(url, data=data).json()
print(res)