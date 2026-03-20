# streamx

Send data to the frontend in realtime using this library

## installation

npm

```sh
npm install streamx-js
```

bun

```sh
bun add streamx-js
```

yarn

```sh
bun add streamx-js
```

## Web

In your front-end, you can listen to messages like this

```js
import StreamX from "streamx-js";

// Create a new StreamX instance
// baseUrl: optional, defaults to "https://api.streamx.co.ke"
// channel: optional, defaults to "default"
const stream = new StreamX("https://api.streamx.co.ke", "your-channel");

// add events to listen to
stream.on("eventName", (data) => {
  console.log(data);
});

stream.on("eventName2", (data) => {
  console.log(data);
});

// close subscription anytime when done
stream.destroy();
```

## APIs

On your APIs, simply make a post request to our API in below format to push messages

### Example in python

```python
import requests
import json


headersList = {
 "Authorization": "67936f09181d9b0262116c15",
 "Content-Type": "application/json"
}

payload = json.dumps({
  "instanceID": "instance-45896",
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
```

### Contributions

Feel free to contribute to this project. Your contributions will be very appreciated

🎉 Happy Coding 🎉
