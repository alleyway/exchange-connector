import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import Byte = GoogleAppsScript.Byte;


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
      return getCoinbasePrice(symbol,base,date)

    case "huobi":
      return getHuobiPrice(symbol,base,date)

    case "binance":
      return 2222

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


const getCoinbasePrice = (symbol: string, base: string, date: Date) => {

  const formattedDate = Utilities.formatDate(date, 'GMT', 'yyyy-MM-dd')

  let requestUrl = `https://api.coinbase.com/v2/prices/${symbol}-${base}/spot?date=${formattedDate}`;
  const response = UrlFetchApp.fetch(requestUrl)
  Logger.log(response.getContentText());
  const parsedResponse = JSON.parse(response.getContentText())
  return Number(parsedResponse.data.amount)
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

  Logger.log("sig: ", signature)

  params["sign"] = signature

  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // const options : URLFetchRequestOptions = {
  //   method: "get" ,
  //   payload: params
  // }


  let requestUrl = `https://api.bybit.com/v2/private/wallet/balance?${queryString}`;

  //Logger.log(requestUrl)

  const response = UrlFetchApp.fetch(requestUrl)


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

  Logger.log("ordered: ", JSON.stringify(orderedParams))

  const signature = Utilities.computeHmacSha256Signature(orderedParams, secret)
    .map(function (chr) {
      return (chr + 256).toString(16).slice(-2)
    })
    .join('')

  return signature

  //return createHmac('sha256', secret).update(orderedParams).digest('hex');
}
