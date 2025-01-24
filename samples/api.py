import requests
import json

headersList = {
 "Authorization": "67936f09181d9b0262116c15",
 "Content-Type": "application/json"
}

payload = json.dumps({
  "instanceID": "b06ec5d2-7e98-4608-83c7-a59100549aa2",
  "channel":"accounts",
  "event": "top-up",
  "message": {
    "balance_before": 2580,
    "balance_after": 4580,
    "amount": 2000,
    "currency":"KES",
  }
})

response = requests.request("POST", "https://apis.streamx.io/publish", data=payload,  headers=headersList)

print(response.text)