import requests
import json

headersList = {
 "Content-Type": "application/json"
}

payload = json.dumps({
  "channel":"accounts",
  "event": "top-up",
  "message": {
    "balance_before": 2580,
    "balance_after": 4580,
    "amount": 2000,
    "currency":"KES",
  }
})

response = requests.request("POST", "https://api.streamx.co.ke/publish", data=payload,  headers=headersList)

print(response.text)