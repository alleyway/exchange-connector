import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import Byte = GoogleAppsScript.Byte;


/**
 * Gives price for symbol
 *
 * @param {symbol} symbol to look up (eg. "ETHUSD")
 * @param base
 * @param {date} date object which gets parsed from google sheets as UTC
 * @return The spot closing price for that date
 */
function bb_mark_at_time(symbol: string, date: Date) {

    const actualTimestamp = date.getTime()/1000 // in seconds

    const requestTimestamp = actualTimestamp - 60 // subtract 1 minute to make sure our results contain the time

    // interval of "1" is "one minute"
    let requestUrl = `https://api.bybit.com/v2/public/mark-price-kline?symbol=${symbol}&interval=1&from=${requestTimestamp}&limit=3`;

    Logger.log(requestUrl)

    const response = UrlFetchApp.fetch(requestUrl)


    //Logger.log(response.getContentText());

    const responseJson = JSON.parse(response.getContentText())

    const dataArray = responseJson.result

    if (responseJson.ret_code !== 0) {
        console.error(responseJson.ret_msg)
        return 0
    }

    for (const val of dataArray) {
        //console.log("val.start_at: " + val.start_at + ", actualTimestamp: " + actualTimestamp)
        if (val.start_at === actualTimestamp) return val.open
    }

    // {
    //   ...,
    // "result": [
    //   {
    //     "id": 6683600,
    //     "symbol": "BTCUSD",
    //     "period": "1",
    //     "start_at": 1610529840,
    //     "open": 35059.6,
    //     "high": 35084.57,
    //     "low": 34999.26,
    //     "close": 35003.43
    //   },...]
    // )


    //return responseJson.result
    return "error: no result found for timestamp"
}

/**
 * Gives price for symbol
 *
 * @param {symbol} symbol to look up
 * @param base
 * @param {date} date object eg 10/26/2020
 * @param exchange
 * @return The spot closing price for that date
 */
function csprice(symbol: string, base: string, date: Date, exchange: string) {

    switch (exchange.toLowerCase()) {

        case "coinbase":
            return getCoinbasePrice(symbol, base, date)

        case "huobi":
            return getHuobiPrice(symbol, base, date)

        case "binance":
            return getBinancePrice(symbol, base, date)

        default:
            return "unknown exchange: " + exchange
    }
}

const getHuobiPrice = (symbol: string, base: string, date: Date) => {

    //https://api.huobi.pro/market/history/kline?symbol=btcusdt&period=1day&size=1&start=1604065179776

    const formattedTimestamp = date.getTime()
    Logger.log("timestamp: ", formattedTimestamp)
    let requestUrl = `https://api.huobi.pro/market/history/kline?symbol=${symbol.toLowerCase()}${base.toLowerCase()}&period=1day&size=1&start=${formattedTimestamp}`;
    Logger.log("request url: ", requestUrl)
    const response = UrlFetchApp.fetch(requestUrl)
    Logger.log(response.getContentText());
    const parsedResponse = JSON.parse(response.getContentText())
    return Number(parsedResponse.data[0].close)

}


const getCoinbasePrice = (base: string, quote: string, date: Date) => {

    const formattedDateToday = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd')
    const formattedDate = Utilities.formatDate(date, 'GMT', 'yyyy-MM-dd')

    let requestUrl = `https://api.coinbase.com/v2/prices/${base}-${quote}/spot`;

    if (formattedDate !== formattedDateToday) {
        requestUrl = requestUrl + `?date=${formattedDate}`
    }
    Logger.log(requestUrl)
    const response = UrlFetchApp.fetch(requestUrl)
    Logger.log(response.getContentText());
    const parsedResponse = JSON.parse(response.getContentText())
    return Number(parsedResponse.data.amount)
}

const getBinancePrice = (symbol: string, quote: string, date: Date) => {

    const formattedDateToday = Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd')
    const formattedDate = Utilities.formatDate(date, 'GMT', 'yyyy-MM-dd')



    let requestUrl

    if (formattedDate !== formattedDateToday) { //it's not today
        console.log(`Fetching kline price because it's not today: ${formattedDate} != ${formattedDateToday}`)

        requestUrl = `https://api3.binance.com/api/v3/klines?symbol=${symbol}${quote}&interval=1d&startTime=${date.getTime()}&limit=1`
        Logger.log(requestUrl)
        const response = UrlFetchApp.fetch(requestUrl)
        Logger.log(response.getContentText());
        const parsedResponse = JSON.parse(response.getContentText())
        return Number(parsedResponse[0][4])
    } else {
        console.log("fetching current price because it's today")
        // it is today, so get current price
        requestUrl = `https://api3.binance.com/api/v3/avgPrice?symbol=${symbol}${quote}`;
        Logger.log(requestUrl)
        const response = UrlFetchApp.fetch(requestUrl)
        Logger.log(response.getContentText());
        const parsedResponse = JSON.parse(response.getContentText())
        return Number(parsedResponse.price)
    }


}


const getHistoricalPrice = (timestamp: Date, symbol: string, baseAsset: string) => {


}


const getByBitBalances = (apiKey: string, secret: string) => {

//  Logger.log("apiKey:", apiKey);


    const timestamp = Date.now();
    const params = {
        "timestamp": timestamp,
        "api_key": apiKey,
    };

    const signature = getSignature(params, secret)

    Logger.log("sig: " + signature)

    params["sign"] = signature

    const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');

    // const options : URLFetchRequestOptions = {
    //   method: "get" ,
    //   payload: params
    // }


    let requestUrl = `https://api.bybit.com/v2/private/wallet/balance?${queryString}`;

    Logger.log(requestUrl)

    const response = UrlFetchApp.fetch(requestUrl)

    //if (response.getResponseCode() !== 200) {
        Logger.log("error " + response.getResponseCode() +  response.getContentText())
    //}

    //Logger.log(response.getContentText());

    const responseJson = JSON.parse(response.getContentText())


    return responseJson.result
}


const getSignature = (parameters, secret) => {
    let orderedParams = "";
    Object.keys(parameters).sort().forEach(function (key) {
        orderedParams += key + "=" + parameters[key] + "&";
    });
    orderedParams = orderedParams.substring(0, orderedParams.length - 1);

    Logger.log("ordered: " + JSON.stringify(orderedParams))

    const signature = Utilities.computeHmacSha256Signature(orderedParams, secret)
        .map(function (chr) {
            return (chr + 256).toString(16).slice(-2)
        })
        .join('')

    return signature

    //return createHmac('sha256', secret).update(orderedParams).digest('hex');
}
