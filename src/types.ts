interface TarkovToolsItem {
    id: string
    lastLowPrice: number | null
    buyFor: {
        source: string
        price: number
    }[]
}

interface TarkovToolsResponse {
    itemsByType: TarkovToolsItem[]
}

interface PriceHistory {
    date: number
    price: number | null
}
