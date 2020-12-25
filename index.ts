import Twit from 'twit';
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { promisify } from 'util'

dotenv.config()

class CovidTweeter {
  private API_URL = process.env.API_URL
  private HOSPITAL_URL = process.env.HOSPITAL_URL || ''
  private ICU_URL = process.env.ICU_URL || ''
  private consumer_key = process.env.APPLICATION_CONSUMER_KEY
  private consumer_secret = process.env.APPLICATION_CONSUMER_SECRET
  private access_token = process.env.ACCESS_TOKEN
  private access_token_secret = process.env.ACCESS_TOKEN_SECRET
  private twitClient: Twit

  constructor() {
    if (this.consumer_key && this.consumer_secret && this.access_token && this.access_token_secret) {
      this.twitClient = new Twit({
        consumer_key: this.consumer_key,
        consumer_secret: this.consumer_secret,
        access_token: this.access_token,
        access_token_secret: this.access_token_secret
      });
    } else {
      throw new Error('Twitter keys not set')
    }
  }


  tweetSummary = async () => {
    try {
      const currDate = new Date()
      const dataFreshnessDate = await fetch(`${this.API_URL}/info/date`, { method: 'GET' })
      const cases = await fetch(`${this.API_URL}/daily/cases`, { method: 'GET' })
      const deaths = await fetch(`${this.API_URL}/daily/deaths`, { method: 'GET' })
      const hospitalCases = await fetch(this.HOSPITAL_URL, { method: 'GET' })
      const icuCases = await fetch(this.ICU_URL, { method: 'GET' })
      const casesParsed = await cases.json()
      const deathsParsed = await deaths.json()
      const hospitalCasesParsed = await hospitalCases.json()
      const icuCasesParsed = await icuCases.json()
      const dataFreshnessDateParsed = new Date(await dataFreshnessDate.text()).toDateString()
      const hospitalizations = hospitalCasesParsed.features[0].attributes.SUM_number_of_confirmed_covid_1_sum
      const icuAdmissions = icuCasesParsed.features[0].attributes.ncovidconf_sum

      const formattedDate = currDate.toLocaleDateString('en-ie', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const tweetText = `${formattedDate}
Cases: ${casesParsed} 🦠
Deaths: ${deathsParsed} ⚰️
Confirmed cases in Hospital: ${hospitalizations} 🩺
Confirmed cases in ICU: ${icuAdmissions} 🏥
#COVID19 #ireland #covid19Ireland`

      if (currDate.toDateString() === dataFreshnessDateParsed) {
        await this.postPromise(tweetText)
      } else {
        console.log('Stale data. Skipping...')
      }
    } catch (err) {
      console.error(err)
    }
  }

  private postPromise = promisify(
    (tweetText: string) => this.twitClient.post('statuses/update', { status: tweetText }, (err, data, response) => {
        if(err) console.error(`Error: ${JSON.stringify(err)}`)
        if(response) console.log(`Response: ${JSON.stringify(response)}`)
        if(data) console.log(`Data: ${JSON.stringify(data)}`)
      })
  )
}

exports.handler = async () => {
  const bot = new CovidTweeter
  await bot.tweetSummary()
}
