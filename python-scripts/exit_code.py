import sys
import requests
import json
headers = {
  'Accept': 'application/json',
  'X-ZAP-API-Key': '12345'
}

r = requests.get('http://localhost:8080/JSON/alert/view/alertCountsByRisk', params={

}, headers = headers)

response=r.json()

## Remove the u and convert into unicode
json_response=json.dumps(response)

## Convert into json
response_content_json=json.loads(json_response)

## Retrive
High=response_content_json['High']

Medium=response_content_json['Medium']

Low=response_content_json['Low']
## Setting the threshold limit

if (High > 0 or Medium > 0 or Low > 0 ) :
 exit(1)