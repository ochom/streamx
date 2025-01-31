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

## Registration

You will need an `API key` and an `instance-id` to push and subscribe to messages. To get these you need a StreamX account

If you don't have an account with us already, head over to <https://streamx.web.app/signup> to create a free account

## API Keys & StreamX instances

Once registered, Get your API key in `Profile` menu

A default instance will always be created for you but you can create your custom instances under the `Instances` menu

Once an Instance is created, you can copy the id to use in your `APIs` and `streamx-js`

## Web

In your front-end, you can listen to messages like this

```js
import Stream from streamx-js

const stream = new Stream('publicKey', 'instanceID', 'channelName')


// add events to listen to
stream.on('eventName', (data)=>{
  console.log(data)
})


stream.on('eventName2', (data)=>{
  console.log(data)
})


// close subscription anytime when done
stream.close()
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
```

### Contributions

Feel free to contribute to this project. Your contributions will be very appreciated

🎉 Happy Coding 🎉
