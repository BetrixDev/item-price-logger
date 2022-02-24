interface TarkovToolsItem {
    id: string
    lastLowPrice: number | null
    sellFor: {
        price: number
    }[]
}

interface TarkovToolsResponse {
    itemsByType: TarkovToolsItem[]
}

interface PriceHistory {
    date: number
    price: number
}
