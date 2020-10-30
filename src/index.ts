import URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
import Byte = GoogleAppsScript.Byte;


/**
 * Gives price for symbol
 *
 * @param {symbol} symbol to look up
 * @param {base} quote currency (eg. USD)
 * @param {date} date object eg 10/26/2020
 * @param {exchange} such as "coinbase" etc
 * @return The spot closing price for that date
 */
function csprice(symbol:string, base: string, date, exchange:string) {
  return 9999
}


/**
 *
 * @param date - in YYYY-MM-DD format
 * @param pair - "BTC-USD"
 */

const getCoinbasePrice = (date: string, pair: string) => {


  let requestUrl = `https://api.coinbase.com/v2/prices/${pair}/spot?date=${date}`;

  //Logger.log(requestUrl)

  const response = UrlFetchApp.fetch(requestUrl)


  Logger.log(response.getContentText());

  const responseJson = JSON.parse(response.getContentText())



  return "999"

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
