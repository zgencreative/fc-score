data = {
    "T2": [
      {
        "ID": "450",
        "EL": [
          {
            "Eid": "1416739",
            "T1": [
              {
                "ID": "450",
                "Img": "enet/8548.png"
              }
            ],
            "T2": [
              {
                "ID": "3153",
                "Img": "enet/46037.png"
              }
            ],
            "Tr1": "5",
            "Tr2": "0",
            "Esid": 6,
            "Eps": "FT",
            "Ewt": 1,
            "Epr": 2
          },
          {
            "Eid": "1266679",
            "T1": [
              {
                "ID": "450",
                "Img": "enet/8548.png"
              }
            ],
            "T2": [
              {
                "ID": "4672",
                "Img": "enet/8485.png"
              }
            ],
            "Tr1": "3",
            "Tr2": "0",
            "Esid": 6,
            "Eps": "FT",
            "Ewt": 1,
            "Epr": 2
          },
          {
            "Eid": "1266726",
            "T1": [
              {
                "ID": "450",
                "Img": "enet/8548.png"
              }
            ],
            "T2": [
              {
                "ID": "4679",
                "Img": "enet/8467.png"
              }
            ],
            "Tr1": "3",
            "Tr2": "1",
            "Esid": 6,
            "Eps": "FT",
            "Ewt": 1,
            "Epr": 2
          },
          {
            "Eid": "1266667",
            "T1": [
              {
                "ID": "3077",
                "Img": "teambadge/dundee-fc.png"
              }
            ],
            "T2": [
              {
                "ID": "450",
                "Img": "enet/8548.png"
              }
            ],
            "Tr1": "1",
            "Tr2": "1",
            "Esid": 6,
            "Eps": "FT",
            "Ewt": 0,
            "Epr": 2
          },
          {
            "Eid": "1266711",
            "T1": [
              {
                "ID": "405",
                "Img": "enet/10251.png"
              }
            ],
            "T2": [
              {
                "ID": "450",
                "Img": "enet/8548.png"
              }
            ],
            "Tr1": "3",
            "Tr2": "3",
            "Esid": 6,
            "Eps": "FT",
            "Ewt": 0,
            "Epr": 2
          }
        ]
      }
    ]
  }
mu = [2,3,1,1,2]

# List untuk menyimpan hasil yang sesuai dengan ID tim T1
results = []

for match in data['T2'][0]['EL']:
    if match['T2'][0]['ID'] == data['T2'][0]['ID']:
        if match['Tr2'] > match['Tr1']:
            results.append(1)
        elif match['Tr2'] < match['Tr1']:
            results.append(2)
        else:
            results.append(3)
    else:
        if match['Tr1'] > match['Tr2']:
            results.append(1)
        elif match['Tr1'] < match['Tr2']:
            results.append(2)
        else:
            results.append(3)

# Menampilkan hasil
print(results)
