import sys
import requests
import json
headers = {
  'Accept': 'application/json',
  'X-ZAP-API-Key': '12345'
}

r = requests.get('http://localhost:8080/JSON/alert/view/alertsByRisk', params={

}, headers = headers)

response=r.json()

json_response=json.dumps(response)

print(json_response)

#if __name__ == "__main__":
 #   main() #calling the main function