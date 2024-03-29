# Tarkov Item Price Logger (very outdated)

A simple REST API written in [Node.js](https://nodejs.org/en/) which will log the price of all items in Escape from Tarkov every hour

- This API is written to be used with [Tarkov Helper](https://github.com/BetrixDev/Tarkov-Helper), but anyone can make use of this project following the MIT license
- This project makes use of the amazing API provided by [Tarkov Tools](https://tarkov-tools.com/api/) and wouldn't be possible without them

# Request
```ts
    const requestUrl = `http://${SERVER_HOSTNAME}:${SERVER_PORT}/${itemId}/${time}`
    const exampleUrl = `http://localhost:8000/59faff1d86f7746c51718c9c/1`
```
- **itemId**: The id of the item requested
- **time**: The amount of days of prices requested


# Reponse
**Type defs**
```ts
    interface PricePoint {
        /**Timestamp of when the point was logged */
        date: number
        /**Price of the item */
        price: number
    }

    interface Response {
        /**Root element */
        pricehistory: PricePoint[]
    }
```
**Json**
```json
{
  "pricehistory": [
    {
      "date": 1644665405000,
      "price": 276775
    },
    {
      "date": 1644667205000,
      "price": 276775
    },
    {
      "date": 1644669005000,
      "price": 276775
    },
    {
      "date": 1644670805000,
      "price": 276775
    }
  ]
}
```

# Self-Hosting

- If you wish to host this API on your own, you are free to do so.
- Files are written locally on the machine, this can be changed fairly easily to account for different services

### Enviroment Variables
There are some required enviroment variables:

- **DATABASE_LOCATION**: The exact path of where you would like to store the prices
- **SERVER_PORT**: The port in which the API will listen on *(optional might be provived from a hosting service)*

### Node Commands
- `npm i` to download all needed dependencies
- `npm build` will compile to API into Javascript
- `npm start` will start the API using [PM2](https://pm2.keymetrics.io)
