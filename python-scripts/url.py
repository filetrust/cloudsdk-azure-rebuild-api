import requests
headers = {
  'Accept': 'application/json',
  'X-ZAP-API-Key': '12345'
}

r = requests.get('http://localhost:8080/JSON/core/view/urls/', params={

}, headers = headers)

print r.json()