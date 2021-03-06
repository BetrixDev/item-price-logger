import express from 'express'
import { scheduleJob } from 'node-schedule'
import { gql, request } from 'graphql-request'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import logger from './logger'
dotenv.config()

const NAMESPACE = 'Server'
const DATABASE_LOCATION = process.env.DATABASE_LOCATION as string
const SERVER_PORT = (process.env.PORT ?? process.env.SERVER_PORT ?? '8000') as string
const SERVER_HOSTNAME = (process.env.HOSTNAME ?? process.env.SERVER_HOSTNAME ?? 'localhost') as string

if (!DATABASE_LOCATION) {
    throw new Error('Please specify a DATABASE_LOCATION in .env')
}

// Check for the database location existing or not
if (!existsSync(path.join(DATABASE_LOCATION))) {
    try {
        mkdirSync(DATABASE_LOCATION)
    } catch {
        throw new Error(`Unknown directory "${DATABASE_LOCATION}" in DATABASE_LOCATION`)
    }
} else {
    readdirSync(DATABASE_LOCATION).forEach((file) => {
        // Very simple check, nothing too deep
        if (!file.endsWith('.json')) {
            throw new Error(`Invalid files located in ${DATABASE_LOCATION}`)
        }
    })
}

const query = gql`
    {
        itemsByType(type: any) {
            id
            lastLowPrice
            sellFor {
                price
            }
        }
    }
`

const getItems = async (): Promise<TarkovToolsItem[]> => {
    return await request<TarkovToolsResponse>('https://api.tarkov.dev/graphql', query).then((res) => res.itemsByType)
}

/**Will return lastLowPrice if it's defined, else will return the highest value in sellFor */
const itemLowestPrice = (item: TarkovToolsItem): number => {
    // null and 0 are both falsy in js
    if (!item.lastLowPrice) {
        const lowestPrice = item.sellFor.sort((a, b) => b.price - a.price)[0]

        return lowestPrice?.price ?? undefined
    } else {
        return item.lastLowPrice
    }
}

// Logs the each item's price every hour
scheduleJob('0 */1 * * *', async () => {
    logger.info(NAMESPACE, 'Logging prices')

    const date = Math.round(Date.now() / 1000) * 1000 // Makes last digits zero for cleaner numbers

    const items = await getItems()

    for (const item of items) {
        const itemFilePath = path.join(DATABASE_LOCATION, `${item.id}.json`)

        const newData = { date: date, price: itemLowestPrice(item) }

        if (existsSync(itemFilePath)) {
            let file = JSON.parse(readFileSync(itemFilePath).toString()) as PriceHistory[] // get current data
            file.push(newData) // append data

            writeFileSync(itemFilePath, JSON.stringify(file))
        } else {
            const newFile: PriceHistory[] = [newData]

            writeFileSync(itemFilePath, JSON.stringify(newFile))
        }
    }

    logger.info(NAMESPACE, 'Logged prices')
})

// API

const app = express()

app.get('/:id/:time', (req, res) => {
    try {
        const id = req.params.id
        /**in days */
        const time = Number(req.params.time)

        logger.info(NAMESPACE, 'New request', { id, time })

        const data = JSON.parse(readFileSync(path.join(DATABASE_LOCATION, `${id}.json`)).toString())

        res.status(200).json({ pricehistory: data.slice(time * -24) })
    } catch (e) {
        logger.info(NAMESPACE, 'Error handling request', e)

        res.sendStatus(404)
    }
})

app.listen(SERVER_PORT, () => {
    logger.info(NAMESPACE, `Server listening on port http://${SERVER_HOSTNAME}:${SERVER_PORT}`)
})
