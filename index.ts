import Twit from 'twit';
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { promisify } from 'util'

dotenv.config()

export interface ICountryStat {
  Country: string
  CountryCode: string,
  Slug: string,
  NewConfirmed: number,
  TotalConfirmed: number,
  NewDeaths: number,
  TotalDeaths: number,
  NewRecovered: number,
  TotalRecovered: number,
  Date: string
}

const API_URL = process.env.API_URL || ''

const twitClient = new Twit({
  consumer_key: process.env.APPLICATION_CONSUMER_KEY || '',
  consumer_secret: process.env.APPLICATION_CONSUMER_SECRET || '',
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const tweetSummary = async () => {
  try {
    const res = await fetch(API_URL, { method: 'GET', redirect: 'follow' })
    const stats = await res.json()
    const irishSummary: ICountryStat = stats['Countries'].filter((country: ICountryStat) => country.Slug === 'ireland')[0]
    const date = new Date(irishSummary.Date)
    const formattedDate = date.toLocaleDateString('en-ie', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const tweetText = `${formattedDate}
Cases: ${irishSummary.NewConfirmed} 🦠
Deaths: ${irishSummary.NewDeaths} ⚰️
#COVID19 #ireland #covid19Ireland`

    console.log({ tweetText })
    await postPromise(tweetText)
  } catch (err) {
    console.log('Error caught')
    console.error(err)
  }
}

const postPromise = promisify(
  (tweetText: string) => twitClient.post('statuses/update', { status: tweetText }, (err, data, response) => {
      if(err) console.error(`Error: ${JSON.stringify(err)}`)
      if(response) console.log(`Response: ${JSON.stringify(response)}`)
      if(data) console.log(`Data: ${JSON.stringify(data)}`)
    })
)


exports.handler = async () => {
  await tweetSummary()
}

tweetSummary()
