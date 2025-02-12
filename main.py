from flask import Flask, render_template, jsonify, url_for, request, session, redirect
import requests
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# BACKEND


@app.route('/api/football/detailCountry/<country>/')
def detailCountry(country, methods=["GET"]):
    img_badge = 'https://static.lsmedia1.com/competition/high/'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'
    url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/category-s/soccer/{country}?locale=ID"

    try:
        # Mengirimkan request GET
        response = requests.get(url, headers={'Accept': 'application/json'})
        response.raise_for_status()  # Memeriksa apakah ada error HTTP

        res = response.json()
        data = []

        # Memeriksa dan memproses data dari "Stages"
        if 'Stages' in res:
            for stage in res['Stages']:
                badge_url = (
                    img_badge + stage.get('badgeUrl', '')
                    if 'badgeUrl' in stage
                    else f"https://static.lsmedia1.com/i2/fh/{stage.get('Ccd', '')}.jpg"
                )

                # Cek apakah Snm sudah ada di data
                existing_snm = [item.get('CompN') for item in data]
                if stage.get('CompN', '') not in existing_snm:
                    data.append({
                        'Sid': stage.get('Sid', ''),
                        'Snm': stage.get('Snm', ''),
                        'Scd': stage.get('Scd', ''),
                        'Cnm': stage.get('Cnm', ''),
                        'badgeUrl': badge_url,
                        'urlComp': f"{stage.get('Ccd', '')}.{stage.get('Scd', '')}",
                        'CompId': stage.get('CompId', ''),
                        'CompN': stage.get('CompN', ''),
                        'CompST': stage.get('CompST', ''),
                    })

        return jsonify({
            'code': 200,
            'message': 'success',
            'data': data,
        })

    except Exception as e:
        # Menangani error jika terjadi masalah
        return jsonify({
            'code': 500,
            'message': 'Error fetching data',
            'error': str(e),
        })


@app.route('/api/football/<date>/', methods=["GET"])
def index(date):
    # Define the URL for the external API request
    url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/date/soccer/{date}/7?countryCode=ID&locale=en&MD=1"
    img_badge = 'https://static.lsmedia1.com/competition/high/'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'

    # Send GET request using requests
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for HTTP issues
        data = response.json()  # Parse JSON response

        # Initialize response dictionary
        response_data = {
            'code': 200,
            'message': 'success',
            'data': []
        }

        # Loop through the stages and process data
        for stage_data in data.get('Stages', []):
            badge_url = (
                url_for('static', filename='img/friendlist.jpg')
                if 'Friendlies' in (stage_data.get('Snm', '') or '')
                else (
                    f"{img_badge}{stage_data.get('badgeUrl', '')}"
                    if stage_data.get('badgeUrl')
                    else f"https://static.lsmedia1.com/i2/fh/{stage_data.get('Ccd', '')}.jpg"
                )
            )

            stage = {
                "Sid": stage_data.get('Sid'),
                "Snm": stage_data.get('Snm'),
                "Scd": stage_data.get('Scd'),
                "Cnm": stage_data.get('Cnm'),
                "CnmT": stage_data.get('CnmT'),
                "Csnm": stage_data.get('Csnm', ''),
                "Ccd": stage_data.get('Ccd'),
                "CompID": stage_data.get('CompId', ''),
                "CompN": stage_data.get('CompN', ''),
                "urlComp": f"{stage_data.get('CnmT')}.{stage_data.get('Scd')}",
                "badgeUrl": badge_url,
                "Events": []
            }

            # Loop through the events in each stage
            for event_data in stage_data.get('Events', []):
                event = {
                    'IDMatch': event_data.get('Eid'),
                    'Team1': {
                        'NMTeam': event_data['T1'][0]['Nm'],
                        'IDTeam': event_data['T1'][0]['ID'],
                        'IMGTeam': f"{img_team}{event_data['T1'][0].get('Img', '')}" if event_data['T1'][0].get('Img') else url_for('static', filename='img/default_team.png'),
                    },
                    'Team2': {
                        'NMTeam': event_data['T2'][0]['Nm'],
                        'IDTeam': event_data['T2'][0]['ID'],
                        'IMGTeam': f"{img_team}{event_data['T2'][0].get('Img', '')}" if event_data['T2'][0].get('Img') else url_for('static', filename='img/default_team.png'),
                    },
                    'Status_Match': event_data.get('Eps'),
                    'time_start': event_data.get('Esd')
                }

                # Check if the match is canceled, postponed, or not started
                if event_data.get('Eps') in ['NS', 'Canc.', 'Postp.']:
                    event['Status_Match'] = event_data['Eps']
                else:
                    # Include score if available
                    event['Score1'] = event_data.get('Tr1')
                    event['Score2'] = event_data.get('Tr2')

                # Append the event to the stage's Events list
                stage['Events'].append(event)

            # Add the stage to the final response data
            response_data['data'].append(stage)

        # Return response data
        return response_data

    except requests.exceptions.RequestException as e:
        # Handle any exceptions (e.g., network errors)
        return {
            'code': 500,
            'message': f'Failed to fetch data: {str(e)}',
            'data': []
        }


@app.route('/api/sorted_data/', defaults={'date': None}, methods=['GET'])
@app.route('/api/sorted_data/<date>/', methods=['GET'])
def sorted_data(date):
    if not date:
        # Mendapatkan tanggal saat ini
        current_date = datetime.datetime.now()

        # Memformat tanggal ke format 'yyyymmdd'
        date = current_date.strftime('%Y%m%d')

    index_data = index(date)
    liga_tertentu = requests.get(
        "https://prod-cdn-search-api.lsmedia1.com/api/v2/search/soccer/stage?limit=15").json()
    liga_tertentu = ['18173', '18418', '18176', '18420', '18227', '20106', '18483',
                     '18546', '17004', '19232', '19243', '19244', '20222', '18181', '18599', '18307']
    sorted_data = {
        'live': [],
        'previous': [],
        'next': []
    }
    for match in index_data['data']:
        events = match['Events']
        if match['Sid'] in liga_tertentu or match['Sid'] == '18822':

            live_events = []
            previous_events = []
            next_events = []

            for event in events:
                if event['Status_Match'] == 'FT' or event['Status_Match'] == 'AP' or event['Status_Match'] == 'AET' or event['Status_Match'] == 'Aband.' or event['Status_Match'] == 'AW':
                    previous_events.append(event)
                elif event['Status_Match'] == 'NS' or event['Status_Match'] == 'Postp.' or event['Status_Match'] == 'Canc.':
                    next_events.append(event)
                else:
                    live_events.append(event)

            if live_events:
                sorted_data['live'].append({"Sid": match.get('Sid'),
                                            'Snm': match.get('Sds', '') or match.get('Snm', ''),
                                            "Scd": match.get('Scd'),
                                            "Cnm": match.get('Cnm'),
                                            "CnmT": match.get('CnmT'),
                                            "Csnm": match.get('Csnm', ''),
                                            "Ccd": match.get('Ccd'),
                                            "CompID": match.get('CompId', ''),
                                            "CompN": match.get('CompN', ''),
                                            "urlComp": f"{match.get('CnmT')}/{match.get('Scd')}",
                                            "badgeUrl": match.get('badgeUrl'),
                                            'events': live_events})
            if previous_events:
                sorted_data['previous'].append({"Sid": match.get('Sid'),
                                                'Snm': match.get('Sds', '') or match.get('Snm', ''),
                                                "Scd": match.get('Scd'),
                                                "Cnm": match.get('Cnm'),
                                                "CnmT": match.get('CnmT'),
                                                "Csnm": match.get('Csnm', ''),
                                                "Ccd": match.get('Ccd'),
                                                "CompID": match.get('CompId', ''),
                                                "CompN": match.get('CompN', ''),
                                                "urlComp": f"{match.get('CnmT')}/{match.get('Scd')}",
                                                "badgeUrl": match.get('badgeUrl'),
                                                'events': previous_events})
            if next_events:
                sorted_data['next'].append({"Sid": match.get('Sid'),
                                            'Snm': match.get('Sds', '') or match.get('Snm', ''),
                                            "Scd": match.get('Scd'),
                                            "Cnm": match.get('Cnm'),
                                            "CnmT": match.get('CnmT'),
                                            "Csnm": match.get('Csnm', ''),
                                            "Ccd": match.get('Ccd'),
                                            "CompID": match.get('CompId', ''),
                                            "CompN": match.get('CompN', ''),
                                            "urlComp": f"{match.get('CnmT')}/{match.get('Scd')}",
                                            "badgeUrl": match.get('badgeUrl'),
                                            'events': next_events})
    return jsonify(sorted_data)


# Default nilai keyword adalah None
@app.route('/api/search/', defaults={'keyword': None}, methods=["GET"])
# Rute ketika keyword diberikan
@app.route('/api/search/<keyword>/', methods=["GET"])
def search(keyword=''):
    img_badge = 'https://static.lsmedia1.com/competition/high/'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'
    response_data = {
        'code': 200,
        'message': 'success',
        'data': []
    }
    try:
        if keyword:
            search_url = f"https://prod-cdn-search-api.lsmedia1.com/api/v2/search/soccer?query={keyword}&limit=10&locale=ID&teams=true&stages=true&categories=true&countryCode=ID"
        else:
            search_url = "https://prod-cdn-search-api.lsmedia1.com/api/v2/search/soccer?locale=ID&limit=5&teams=true&stages=true&categories=true&countryCode=ID"
        res = requests.get(search_url).json()
        data = {
            'teams': [],
            'stages': [],
            'players': [],
            'categories': [],
        }

        # Mengisi data untuk 'teams'
        for team in res.get('Teams', []):
            data['teams'].append({
                'IDTeam': team.get('ID', ''),
                'NMTeam': team.get('Nm', ''),
                'IMGTeam': f"{img_team}{team.get('Img', '')}" if team.get('Img') else url_for('static', filename='img/default_team.png'),
                'CoNm': team.get('CoNm', ''),
                'CoId': team.get('CoId', ''),
                'Abr': team.get('Abr', ''),
            })

        # Mengisi data untuk 'stages'
        for stage in res.get('Stages', []):
            badge_url = (
                url_for('static', filename='img/friendlist.jpg')
                if 'Friendlies' in (stage.get('Cnm', '') or '')
                else (
                    f"{img_badge}{stage.get('badgeUrl', '')}"
                    if stage.get('badgeUrl')
                    else f"https://static.lsmedia1.com/i2/fh/{stage.get('Ccd', '')}.jpg"
                )
            )
            data['stages'].append({
                'Sid': stage.get('Sid', ''),
                'Snm': stage.get('Sds', '') or stage.get('Snm', ''),
                'Scd': stage.get('Scd', ''),
                'Cnm': stage.get('Cnm', ''),
                'badgeUrl': badge_url,
                'urlComp': f"{stage.get('Ccd', '')}.{stage.get('Scd', '')}",
                'CompId': stage.get('CompId', ''),
                'CompN': stage.get('CompN', ''),
                'CompST': stage.get('CompST', ''),
            })

        # Mengisi data untuk 'categories'
        for category in res.get('Categories', []):
            badge_url = (
                url_for('static', filename='img/friendlist.jpg')
                if 'Friendlies' in (category.get('Cnm', '') or '')
                else (
                    f"{img_badge}{category.get('badgeUrl', '')}"
                    if category.get('badgeUrl')
                    else f"https://static.lsmedia1.com/i2/fh/{category.get('Ccd', '')}.jpg"
                )
            )
            data['categories'].append({
                'Cid': category.get('Cid', ''),
                'Cnm': category.get('Cnm', ''),
                'badgeUrl': badge_url,
                'Ccd': category.get('Ccd', ''),
                'CompId': category.get('CompId', ''),
            })
        response_data['data'] = data
        return jsonify(response_data)
    except requests.exceptions.RequestException as e:
        # Handle any exceptions (e.g., network errors)
        return jsonify({
            'code': 500,
            'message': f'Failed to fetch data: {str(e)}',
            'data': []
        })


@app.route('/api/football/detailMatch/<string:idMatch>/', methods=['GET'])
def get_detail_match(idMatch):
    response = {
        'code': 200,
        'message': 'success',
        'data': []
    }

    summary_url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/incidents/soccer/{idMatch}"
    match_url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/scoreboard/soccer/{idMatch}?locale=ID"
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'

    try:
        # Fetch match data
        match_response = requests.get(match_url)
        match_response.raise_for_status()
        match_data = match_response.json()

        datas = {
            'IDMatch': match_data['Eid'],
            'Score1': match_data.get('Tr1', ''),
            'Score2': match_data.get('Tr2', ''),
            'Team1': {
                'NMTeam': match_data['T1'][0]['Nm'],
                'IDTeam': match_data['T1'][0]['ID'],
                'IMGTeam': img_team + match_data['T1'][0].get('Img', '')
            },
            'Team2': {
                'NMTeam': match_data['T2'][0]['Nm'],
                'IDTeam': match_data['T2'][0]['ID'],
                'IMGTeam': img_team + match_data['T2'][0].get('Img', '')
            },
            'Status_Match': match_data['Eps'],
            'time_start': match_data['Esd'],
            'timeline': {}
        }

        # Fetch summary data
        summary_response = requests.get(summary_url)
        summary_response.raise_for_status()
        summary_data = summary_response.json()

        has_score = ['FT', 'AP', 'AET', 'Aband.', 'AW']

        if match_data['Eps'] in has_score and 'Incs' in summary_data:
            # Ubah keys menjadi integer
            keys = list(map(int, summary_data['Incs'].keys()))
            max_key = max(keys)  # Ambil key terbesar

            for i in range(1, max_key + 1):  # Iterasi dari 1 hingga max_key
                datas['timeline'][f"{i}"] = []  # Tambahkan dictionary kosong

            for key, incidents in summary_data['Incs'].items():
                for incident in incidents:
                    # Buat timeline_entry
                    timeline_entry = {
                        'team': incident['Nm'],
                        # Hilangkan 'min' jika key > 2
                        'min': incident['Min'] if key in ["1", "2", "3"] else None,
                        'minex': incident.get('MinEx', 0),
                        'score': incident.get('Sc', []),
                        'player': []
                    }

                    # Proses pemain dalam incident
                    if 'Incs' in incident and incident['Incs']:
                        for idx, player_incident in enumerate(incident['Incs']):
                            player_entry = {
                                'status': 'goal' if idx == 0 else ('assist' if 'Sc' in player_incident else 'foul'),
                                'info': {
                                    63: 'assists',
                                    # Menangani IR jika IT adalah 62
                                    62: player_incident.get('IR', 'unknown'),
                                    38: 'pen-no-goal',
                                    40: 'pen-no-goal',
                                    41: 'pen-goal',
                                    43: 'yellow card',
                                    44: 'yellow-red card',
                                    45: 'red card',
                                    39: 'penalty'
                                    # Default ke 'goal' jika IT tidak ditemukan
                                }.get(player_incident['IT'], 'goal'),
                                'IDPlayer': player_incident['ID'],
                                'fn': player_incident.get('Fn', ''),
                                'ln': player_incident.get('Ln', ''),
                                'pn': player_incident.get('Pn', '')
                            }
                            timeline_entry['player'].append(player_entry)
                    else:
                        timeline_entry['player'].append({
                            'status': 'goal' if 'Sc' in incident else 'foul',
                            'info': {
                                63: 'assists',
                                62: incident.get('IR', 'unknown'),
                                40: 'pen-no-goal',
                                41: 'pen-goal',
                                43: 'yellow card',
                                44: 'yellow-red card',
                                45: 'red card',
                                39: 'penalty'
                            }.get(incident.get('IT', 0), 'goal'),
                            'IDPlayer': incident.get('ID', ''),
                            'fn': incident.get('Fn', ''),
                            'ln': incident.get('Ln', ''),
                            'pn': incident.get('Pn', '')
                        })

                    # Tambahkan timeline_entry ke key yang sesuai
                    datas['timeline'][key].append(timeline_entry)

        response['data'] = datas
        return response

    except requests.exceptions.RequestException as e:
        return {
            'code': 500,
            'message': 'Error fetching data',
            'error': str(e)
        }


@app.route('/api/football/detailMatch/stat/<string:idMatch>/', methods=['GET'])
def stat(idMatch):
    response = {
        'code': 200,
        'message': 'success',
        'data': []
    }

    # URL API untuk mengambil data statistik
    url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/statistics/soccer/{idMatch}"

    try:
        # Lakukan request GET ke API
        res = requests.get(url)
        res.raise_for_status()  # Periksa jika terjadi error pada HTTP request
        res_data = res.json()  # Konversi response ke dictionary
        if not res_data:
            return response
        else:
            # Proses data 'Stat' (Summary Statistics)
            sum_stat = []
            for stat in res_data.get('Stat', []):
                sum_stat.append({
                    'shon': stat.get('Shon'),
                    'shof': stat.get('Shof'),
                    'blsh': stat.get('Shbl'),
                    'pss': stat.get('Pss'),
                    'crs': stat.get('Cos'),
                    'ofs': stat.get('Ofs'),
                    'fls': stat.get('Fls'),
                    'ths': stat.get('Ths'),
                    'ycs': stat.get('Ycs'),
                    'catt': stat.get('Att'),
                    'gks': stat.get('Gks'),
                    'goa': stat.get('Goa'),
                    'rcs': stat.get('Rcs')
                })

            # Tambahkan data yang sudah diproses ke dalam response
            response['data'].append({
                'IDMatch': res_data.get('Eid'),
                'sum_stat': sum_stat,
            })

    except requests.exceptions.RequestException as e:
        # Tangani error HTTP request
        return {
            'code': 500,
            'message': 'Error fetching data',
            'error': str(e)
        }

    return jsonify(response)


@app.route('/api/football/detailMatch/lineup/<string:idMatch>/')
def get_detail_match_lineup(idMatch):
    url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/lineups/soccer/{idMatch}"

    try:
        # Make the GET request
        response = requests.get(url)
        response.raise_for_status()
        res = response.json()

        if not res:
            return {
                'code': 200,
                'message': 'success',
                'data': []
            }

        # Initialize response data structure
        data = {
            'MatchID': res.get('Eid'),
            'Team1': {
                'Pos': [],
                'IS': [],
                'Fo': res.get('Lu', [{}])[0].get('Fo', ''),
                'Subs': []
            },
            'Team2': {
                'Pos': [],
                'IS': [],
                'Fo': res.get('Lu', [{}])[1].get('Fo', ''),
                'Subs': []
            }
        }

        # Process Team1 Players
        for player in res.get('Lu', [{}])[0].get('Ps', []):
            data['Team1']['Pos'].append(map_player_data(player))

        # Process Team2 Players
        for player in res.get('Lu', [{}])[1].get('Ps', []):
            data['Team2']['Pos'].append(map_player_data(player))

        # Process Team1 IS (Injured or Suspended Players)
        for player in res.get('Lu', [{}])[0].get('IS', []):
            data['Team1']['IS'].append(map_injured_suspended_data(player))

        # Process Team2 IS
        for player in res.get('Lu', [{}])[1].get('IS', []):
            data['Team2']['IS'].append(map_injured_suspended_data(player))

        # Process Substitutions
        process_substitutions(res.get('Subs', {}).get(
            '1', []), data['Team1'], data['Team2'])
        process_substitutions(res.get('Subs', {}).get(
            '2', []), data['Team1'], data['Team2'])

        return jsonify({
            'code': 200,
            'message': 'success',
            'data': data
        })

    except requests.RequestException as e:
        return jsonify({
            'code': 500,
            'message': 'error',
            'data': str(e)
        })


def map_player_data(player):
    return {
        'PlayerID': player.get('Pid'),
        'Fn': player.get('Fn', ''),
        'Ln': player.get('Ln', ''),
        'Pn': player.get('Pn', ''),
        'Np': player.get('Snu', ''),
        'Pon': player.get('Pon', ''),
        'Fp': player.get('Fp', ''),
        'Rate': player.get('Rate', '')
    }


def map_injured_suspended_data(player):
    return {
        'PlayerID': player.get('Pid'),
        'Fn': player.get('Fn', ''),
        'Ln': player.get('Ln', ''),
        'Pn': player.get('Pnt', ''),
        'Pon': player.get('Pon', ''),
        'Rs': player.get('Rs', ''),
        'Rton': player.get('RtonS', '')
    }


def process_substitutions(subs, team1, team2):
    for sub in subs:
        player_data = {
            'PlayerID': sub.get('ID'),
            'Fn': sub.get('Fn', ''),
            'Ln': sub.get('Ln', ''),
            'Pn': sub.get('Pn', ''),
            'Min': sub.get('Min')
        }

        if sub.get('Nm') == 1:
            team1['Subs'].append(player_data)
        else:
            team2['Subs'].append(player_data)


@app.route('/api/football/detailMatch/table/<string:urlComp>/', methods=['GET'])
def rank(urlComp):
    # URL API yang akan diakses
    modified_url = urlComp.replace('.', '/')
    url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/leagueTable-s/soccer/{modified_url}?locale=ID"
    img_badge = 'https://static.lsmedia1.com/competition/high/'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'

    # Melakukan request GET ke API
    response = requests.get(url)

    # Memeriksa apakah request berhasil (status code 200)
    if response.status_code != 200:
        return {
            'code': response.status_code,
            'message': 'Failed to fetch data',
            'data': {}
        }

    # Mendapatkan hasil JSON dari response
    res = response.json()

    # Menyusun response untuk dikembalikan
    data = {
        'Sid': res.get('Sid', ''),
        'Snm': res.get('Snm', ''),
        'Scd': res.get('Scd', ''),
        'Cnm': res.get('Cnm', ''),
        'badgeUrl': img_badge + (res.get('badgeUrl', '')),
        'CompId': res.get('CompId', ''),
        'CompN': res.get('CompN', ''),
        'CompST': res.get('CompST', ''),
        'LeagueTable': []
    }

    if 'LeagueTable' in res and 'L' in res['LeagueTable'] and len(res['LeagueTable']['L']) > 0:
        # Iterasi untuk memasukkan data LeagueTable
        for team in res['LeagueTable']['L'][0]['Tables'][0]['team']:
            data['LeagueTable'].append({
                'rank': team.get('rnk', ''),
                'teamID': team.get('Tid', ''),
                'teamNM': team.get('Tnm', ''),
                'teamIMG': img_team + (team.get('Img', '')),
                'p': team.get('pld', ''),
                'gd': team.get('gd', ''),
                'pts': team.get('pts', ''),
                'w': team.get('win', ''),
                'd': team.get('drw', ''),
                'l': team.get('lst', ''),
                'f': team.get('gf', ''),
                'a': team.get('ga', '')
            })

    # Menyusun data final
    final_response = {
        'code': 200,
        'message': 'success',
        'data': data
    }

    # Mengembalikan data sebagai response JSON
    return jsonify(final_response)


@app.route('/api/football/detailMatch/news/<string:idMatch>/', methods=['GET'])
def news(idMatch):
    response = {
        'code': 200,
        'message': 'success',
        'data': []
    }
    # URL API yang akan diakses
    match_url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/scoreboard/soccer/{idMatch}?locale=ID"
    key = 'JDJhJDEyJFVLNUJ3d2c1MnFCaktnU0w0dzJMNU9GWEJQT0FaSTcwa0ZZUWpIbXF0YVRNMEU3aHZwQkF1'
    try:
        # Fetch match data
        match_response = requests.get(match_url)
        match_response.raise_for_status()
        match_data = match_response.json()

        team_1 = match_data['T1'][0]['Nm'].lower().replace(" ", "-")
        team_2 = match_data['T2'][0]['Nm'].lower().replace(" ", "-")
        slug = f"{team_1},{team_2}"

        api_url = f"https://mansionsportsfc.com/api/news/tag/more?key={key}&slug={slug}"
        url = 'https://mansionsportsfc.com/'

        response2 = requests.get(api_url)
        res2 = response2.json()
        datas = {
                'URL': '',
                'News': '',
            }
        if res2['status'] != 400:
            datas = {
                'URL': url,
                'News': res2['news'],
            }
        response['data'] = datas
        return response

    except requests.exceptions.RequestException as e:
        return {
            'code': 500,
            'message': 'Error fetching data',
            'error': str(e)
        }

@app.route('/api/football/detailComp/<string:urlComp>/', methods=['GET'])
def detailComp(urlComp):
    response = {
        'code': 200,
        'message': 'success',
        'data': []
    }

    # Daftar URL tournament
    modified_url = urlComp.replace('.', '/')
    url_comp_full = f'https://prod-cdn-public-api.lsmedia1.com/v1/api/app/stage/soccer/{modified_url}/7?countryCode=ID&locale=en&MD=1'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'
    img_badge = 'https://static.lsmedia1.com/competition/high/'

    try:
        # Lakukan request GET ke API
        res = requests.get(url_comp_full)
        json_data = res.json()  # Mengonversi response ke format JSON (dict)

        stages = json_data['Stages'][0]
        data = {
            'Sid': stages.get('Sid', ''),
            'Snm': stages.get('Snm', ''),
            'Scd': stages.get('Scd', ''),
            'Cnm': stages.get('Cnm', ''),
            'badgeUrl': img_badge + stages.get('badgeUrl', ''),
            'CompId': stages.get('CompId', ''),
            'CompN': stages.get('CompN', ''),
            'CompST': stages.get('CompST', ''),
            'urlComp': modified_url,
            'Events': [],
            'LeagueTable': []
        }

        schedule = stages.get('Events', [])

        # Loop through the events in each stage
        for event_data in schedule:
            event = {
                'IDMatch': event_data['Eid'],
                'Team1': {
                    'NMTeam': event_data['T1'][0]['Nm'],
                    'IDTeam': event_data['T1'][0]['ID'],
                    'IMGTeam': img_team + event_data['T1'][0].get('Img', '')
                },
                'Team2': {
                    'NMTeam': event_data['T2'][0]['Nm'],
                    'IDTeam': event_data['T2'][0]['ID'],
                    'IMGTeam': img_team + event_data['T2'][0].get('Img', '')
                },
                'Status_Match': event_data['Eps'],
                'time_start': event_data['Esd']
            }

            # Check if the match is canceled, postponed, or not started
            if event_data['Eps'] in ['NS', 'Canc.', 'Postp.']:
                event['Status_Match'] = event_data['Eps']
            else:
                # Include score if available
                event['Score1'] = event_data.get('Tr1', None)
                event['Score2'] = event_data.get('Tr2', None)

            # Append the event to the stage's Events array
            data['Events'].append(event)

        if 'LeagueTable' in stages and stages['LeagueTable']:
            # Iterasi untuk memasukkan data LeagueTable
            for team in stages['LeagueTable']['L'][0]['Tables'][0]['team']:
                data['LeagueTable'].append({
                    'rank': team['rnk'],
                    'teamID': team['Tid'],
                    'teamNM': team['Tnm'],
                    'teamIMG': img_team + team.get('Img', ''),
                    'p': team['pld'],
                    'gd': team['gd'],
                    'pts': team['pts'],
                    'w': team['win'],
                    'd': team['drw'],
                    'l': team['lst'],
                    'f': team['gf'],
                    'a': team['ga']
                })

        response['data'] = data

    except Exception as e:
        return {
            'code': 500,
            'message': 'Error fetching data',
            'error': str(e)
        }, 500

    return response


@app.route('/api/football/detailTeam/<string:idTeam>/', methods=['GET'])
def detailTeam(idTeam):
    # URL API
    url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{idTeam}/details?locale=en&MD=1"
    url_next = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{idTeam}/nextevent"
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'

    try:
        # Mengirimkan request GET ke API
        response = requests.get(url)
        response.raise_for_status()
        res = response.json()

        # Mengirimkan request GET ke API untuk next event
        response_next = requests.get(url_next)
        response_next.raise_for_status()
        res_next = response_next.json()

        # Menyiapkan response data
        data = {
            'NMTeam': res['Nm'],
            'IDTeam': res['ID'],
            'IMGTeam': img_team + res['Img'],
            'Abr': res['Abr'],
            'CoNm': res['CoNm'],
            'CoId': res['CoId'],
            'NextEvent': [],
            'Stages': []
        }

        # Iterasi melalui stages
        for stage in res.get('Stages', []):
            stage_data = {
                'Sid': stage['Sid'],
                'Snm': stage['Snm'],
                'Scd': stage['Scd'],
                'Cid': stage['Cid'],
                'Cnm': stage['Cnm'],
                'CnmT': stage['CnmT'],
                'Csnm': stage.get('Csnm', ''),
                'Ccd': stage.get('Ccd', ''),
                'urlComp': f"{stage['CnmT']}.{stage['Scd']}",
                'events': []
            }

            # Iterasi melalui events dalam stage
            for event in stage.get('Events', []):
                event_data = {
                    'IDMatch': event['Eid'],
                    'Status_Match': event['Eps'],
                    'time_start': event['Esd'],
                    'Team1': {
                        'NMTeam': event['T1'][0]['Nm'],
                        'IDTeam': event['T1'][0]['ID'],
                        'IMGTeam': img_team + event['T1'][0]['Img'],
                        'Abr': event['T1'][0]['Abr']
                    },
                    'Team2': {
                        'NMTeam': event['T2'][0]['Nm'],
                        'IDTeam': event['T2'][0]['ID'],
                        'IMGTeam': img_team + event['T2'][0]['Img'],
                        'Abr': event['T2'][0]['Abr']
                    }
                }

                if event['Eps'] not in ['NS', 'Canc.', 'Postp.', 'Aband.']:
                    event_data['Score1'] = event['Tr1']
                    event_data['Score2'] = event['Tr2']

                stage_data['events'].append(event_data)

            data['Stages'].append(stage_data)

        # Extract event details for NextEvent
        team1 = res_next['Event']['T1'][0]
        team2 = res_next['Event']['T2'][0]

        # Determine last match results for both teams
        team1_last_matches = [
            1 if (match['Tr1'] > match['Tr2'] if match['T1'][0]['ID'] == res_next['Form']['T1'][0]['ID'] else match['Tr2'] > match['Tr1'])
            else 2 if (match['Tr1'] < match['Tr2'] if match['T1'][0]['ID'] == res_next['Form']['T1'][0]['ID'] else match['Tr2'] < match['Tr1'])
            else 3
            for match in res_next['Form']['T1'][0]['EL']
        ]

        team2_last_matches = [
            1 if (match['Tr2'] > match['Tr1'] if match['T2'][0]['ID'] == res_next['Form']['T2'][0]['ID'] else match['Tr1'] > match['Tr2'])
            else 2 if (match['Tr2'] < match['Tr1'] if match['T2'][0]['ID'] == res_next['Form']['T2'][0]['ID'] else match['Tr1'] < match['Tr2'])
            else 3
            for match in res_next['Form']['T2'][0]['EL']
        ]

        # Populate NextEvent details
        data['NextEvent'] = {
            'matchID': res_next['Event']['Eid'],
            'time_start': res_next['Event']['Esd'],
            'team1': {
                'teamNM': team1['Nm'],
                'teamID': team1['ID'],
                'teamIMG': img_team + team1['Img'],
                'CoNm': team1['CoNm'],
                'CoId': team1['CoId'],
                'lastMt': team1_last_matches
            },
            'team2': {
                'teamNM': team2['Nm'],
                'teamID': team2['ID'],
                'teamIMG': img_team + team2['Img'],
                'CoNm': team2['CoNm'],
                'CoId': team2['CoId'],
                'lastMt': team2_last_matches
            }
        }

        # Return the response as JSON
        return {
            'code': 200,
            'message': 'success',
            'data': data
        }

    except requests.RequestException as e:
        # Handle request errors
        return {
            'code': 500,
            'message': f'Error fetching data: {str(e)}'
        }


@app.route('/api/football/detailTeam/playerstat/<string:teamId>/', defaults={'eventId': None})
@app.route('/api/football/detailTeam/playerstat/<string:teamId>/<eventId>/')
def detailPlayerStat(teamId, eventId):
    img_badge = 'https://static.lsmedia1.com/competition/high/'

    # Request pertama untuk mendapatkan detail tim berdasarkan teamId
    url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{teamId}/details?locale=en&MD=1"
    response = requests.get(url)
    res = response.json()

    # Menyiapkan struktur data respons
    datas = {
        'teamNM': res.get('Nm'),
        'teamID': res.get('ID'),
        'teamIMG': res.get('Img'),
        'Abr': res.get('Abr'),
        'CoNm': res.get('CoNm'),
        'CoId': res.get('CoId'),
        'Events': [],
        'PlayerStat': []
    }

    # Proses Stages untuk Events
    for stage in res.get('Stages', []):
        datas['Events'].append({
            'Sid': stage.get('Sid'),
            'Snm': stage.get('Snm'),
            'Cnm': stage.get('Cnm'),
            'CompN': stage.get('CompN', ''),
            'CompST': stage.get('CompST', ''),
            'badgeUrl': stage.get('badgeUrl', '')
        })

    # Jika eventId diberikan, kita ambil statistik pemain untuk event tersebut
    if eventId is not None:
        url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{teamId}/playersstat/{eventId}?limit=20"
    else:
        # Jika eventId tidak diberikan, gunakan Sid dari event pertama di datas['Events']
        # Mendapatkan Sid dari event pertama
        event_sid = datas['Events'][0]['Sid']
        url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{teamId}/playersstat/{event_sid}?limit=20"

    response = requests.get(url)
    res = response.json()

    # Proses statistik pemain
    for stat_item in res.get('Stat', []):
        stat = {
            'Typ': stat_item.get('Typ'),
            'Plrs': []
        }

        for player in stat_item.get('Plrs', []):
            stat['Plrs'].append({
                'Aid': player.get('Aid', ''),
                'Rnk': player.get('Rnk'),
                'Fn': player.get('Fn', ''),
                'Ln': player.get('Ln', ''),
                'Pnm': player.get('Pnm'),
                'Scr': player['Scrs'].get(str(stat['Typ']), ''),
                'Tnm': player.get('Tnm'),
                'Tid': player.get('Tid')
            })

        datas['PlayerStat'].append(stat)

    # Mengembalikan response dalam format JSON
    return {
        'code': 200,
        'message': 'success',
        'data': datas
    }


@app.route('/api/football/detailTeam/squad/<string:id>/', methods=['GET'])
def detailSquad(id):
    # Define the URL
    url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{id}/squad"

    # Make the GET request
    response = requests.get(url)
    res = response.json()

    # Prepare the response
    result = {
        'code': 200,
        'message': 'success',
        'data': {}
    }

    # Build the data structure
    data = {
        'teamID': res.get('ID'),
        'teamNM': res.get('Nm'),
        'CoNm': res.get('CoNm'),
        'teamIMG': res.get('Img'),
        'player': []
    }

    for player in res.get('Ps', []):
        player_data = {
            'playerID': player.get('Pid'),
            'Pn': player.get('Pnm'),
            'Fn': player.get('Fn', ''),
            'Ln': player.get('Ln', ''),
            'CoNm': player.get('CoNm', ''),
            'RegImg': f"https://static.lsmedia1.com/i2/fh/{player.get('RegImg', '')}.jpg" if player.get('RegImg') else '',
            'Np': player.get('Snu', ''),
            'Pos': ''
        }

        # Assign position
        pos_mapping = {
            1: 'GOALKEEPERS',
            2: 'DEFENDERS',
            3: 'MIDFIELDERS',
            4: 'ATTACKERS'
        }

        player_data['Pos'] = pos_mapping.get(player.get('Pos'), 'COACH')

        data['player'].append(player_data)

    result['data'] = data

    return result


@app.route('/api/football/detailTeam/stat/<string:teamId>/', defaults={'eventId': None})
@app.route('/api/football/detailTeam/stat/<string:teamId>/<eventId>/')
def teamStat(teamId, eventId):
    # Define the URL for team details
    url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{teamId}/details?locale=en&MD=1"

    # Make the GET request for team details
    response = requests.get(url)
    res = response.json()

    # Prepare the response structure
    datas = {
        'teamNM': res.get('Nm'),
        'teamID': res.get('ID'),
        'teamIMG': res.get('Img'),
        'Abr': res.get('Abr'),
        'CoNm': res.get('CoNm'),
        'CoId': res.get('CoId'),
        'Events': [],
        'TeamStat': []
    }

    # Process Stages for Events
    for stage in res.get('Stages', []):
        datas['Events'].append({
            'Sid': stage.get('Sid'),
            'Snm': stage.get('Snm'),
            'Cnm': stage.get('Cnm'),
            'CompN': stage.get('CompN', ''),
            'CompST': stage.get('CompST', ''),
            'badgeUrl': stage.get('badgeUrl', '')
        })

    # Requesting team statistics based on eventId
    if eventId is not None:
        # If eventId is provided, use it for the request
        url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{teamId}/teamstat/{eventId}"
    else:
        # If eventId is not provided, use Sid from the first event
        event_sid = datas['Events'][0]['Sid']  # Get Sid from the first event
        url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{teamId}/teamstat/{event_sid}"

    # Make the GET request for team statistics
    response = requests.get(url)
    res = response.json()

    # Add team statistics to the data
    datas['TeamStat'].append(res.get('statsGroup', {}))

    # Return response in JSON format
    return {
        'code': 200,
        'message': 'success',
        'data': datas
    }


@app.route('/api/football/detailTeam/table/<string:id>/', methods=['GET'])
def teamTable(id):
    # Define the URL for the league table
    url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{id}/league-table?type=full&locale=ID"
    img_badge = 'https://static.lsmedia1.com/competition/high/'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'

    # Make the GET request for league table
    response = requests.get(url)
    res = response.json()

    # Prepare the response structure
    data = {
        'Sid': res.get('Sid', ''),
        'Snm': res.get('Snm', ''),
        'Scd': res.get('Scd', ''),
        'badgeUrl': img_badge + res.get('badgeUrl', ''),
        'CompId': res.get('CompId', ''),
        'CompN': res.get('CompN', ''),
        'CompST': res.get('CompST', ''),
        'LeagueTable': []
    }

    # Iterate over the teams in the LeagueTable and add them to the data
    for team in res.get('LeagueTable', {}).get('L', [{}])[0].get('Tables', [{}])[0].get('team', []):
        data['LeagueTable'].append({
            'rank': team.get('rnk'),
            'teamID': team.get('Tid'),
            'teamNM': team.get('Tnm'),
            'teamIMG': img_team + team.get('Img', ''),
            'p': team.get('pld'),
            'gd': team.get('gd'),
            'pts': team.get('pts'),
            'w': team.get('win'),
            'd': team.get('drw'),
            'l': team.get('lst'),
            'f': team.get('gf'),
            'a': team.get('ga')
        })

    # Prepare the final response
    final_response = {
        'code': 200,
        'message': 'success',
        'data': data
    }

    return final_response


@app.route('/api/football/detailTeam/news/<string:idTeam>/', methods=['GET'])
def teamNews(idTeam):
    # Define the URL for the league table
    key = 'JDJhJDEyJFVLNUJ3d2c1MnFCaktnU0w0dzJMNU9GWEJQT0FaSTcwa0ZZUWpIbXF0YVRNMEU3aHZwQkF1'
    url = f"https://prod-cdn-team-api.lsmedia1.com/v1/api/app/team/{idTeam}/details?locale=en&MD=1"
    img_badge = 'https://static.lsmedia1.com/competition/high/'
    img_team = 'https://lsm-static-prod.lsmedia1.com/medium/'

    # Make the GET request for league table
    response = requests.get(url)
    res = response.json()

    team_name = res['Nm']
    slug = team_name.lower().replace(" ", "-")

    api_url = f"https://mansionsportsfc.com/api/news/tag?key={key}&slug={slug}"
    url = 'https://mansionsportsfc.com/'
    response2 = requests.get(api_url)
    res2 = response2.json()

    # Prepare the response structure
    data = {
        'NMTeam': res['Nm'],
        'News': res2['news'],
        'URL': url
    }
    final_response = {
        'code': 200,
        'message': 'success',
        'data': data,
    }

    return final_response

@app.route('/api/football/detailMatch/info/<string:id>/', methods=['GET'])
def detailInfo(id):
    url = f"https://prod-cdn-public-api.lsmedia1.com/v1/api/app/scoreboard/soccer/{id}?locale=ID"
    res = requests.get(url).json()
    data = {
        'code': 200,
        'message': 'success',
        'data': {
            'time_start': res['Esd'],
            'stadium': res['Venue']['Vnm'] if 'Venue' in res and 'Vnm' in res['Venue'] else '',
            'views': res['Venue']['Vsp'] if 'Venue' in res and 'Vsp' in res['Venue'] else ''
        }
    }
    return data

@app.route('/login', methods=['POST'])
def login():
    usn = request.get_json()['email']
    passwd = request.get_json()['password']
    data = {'email':usn, 'password':passwd}
    res = requests.post('https://mansionsportsfc.com/api/login', data=data).json()
    if res['status'] == False:
        return jsonify({"success": False, "message": "Email atau password salah!"})
    else:
        session["id"] = res['user']['id']
        session["user"] = res['user']['name']  # Menyimpan user ke dalam session
        return jsonify({"success": True, "message": "Login berhasil!", "redirect": "/"})

@app.route('/logout')
def logout():
    session.pop("user", None)
    session.pop("id", None)
    return redirect(url_for('home'))
# FRONTEND


@app.route('/', methods=["GET"])
def home():
    host = request.host
    return render_template('home.html', host=host, page_name="home")


@app.route('/match/<string:country>/<string:comp>/<string:idMatch>/', methods=['GET'])
def detailMatch(idMatch, country, comp):
    data = get_detail_match(idMatch)
    data['data']['time_start'] = convert_time(data['data']['time_start'])
    host = request.host
    return render_template('detail_match.html', data=data, host=host, page_name="match")


def convert_time(timestamp):
    # Ensure the timestamp is converted to a string
    timestamp_str = str(timestamp)

    # Parsing the input string to a datetime object
    dt_object = datetime.datetime.strptime(timestamp_str, "%Y%m%d%H%M%S")

    # Formatting the datetime object to the desired output format
    formatted_time = dt_object.strftime("%d.%m.%Y %H:%M")
    return formatted_time


@app.route('/comp/<string:country>/<string:comp>/', methods=['GET'])
def detComp(country, comp):
    data = detailComp(f'{country}.{comp}')
    upcome = []
    ns = []

    for i in data['data']['Events']:
        if i['Status_Match'] == 'FT':
            upcome.append(i)
        else:
            ns.append(i)

    # Membalikkan upcome (gunakan reverse tanpa assignment)
    upcome.reverse()

    # Menggabungkan upcome yang sudah dibalik dengan ns
    data['data']['Events'] = upcome + ns

    host = request.host
    return render_template('detail_comp.html', data=data, host=host, page_name="comp")


@app.route('/team/<string:idTeam>/', methods=['GET'])
def detTeam(idTeam):
    data = detailTeam(idTeam)
    host = request.host
    return render_template('detail_team.html', data=data, host=host, page_name="team")


if __name__ == '__main__':
    app.run(debug=True)
