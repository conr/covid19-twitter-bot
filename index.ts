import Twit, { Twitter } from 'twit';
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { promisify } from 'util'

dotenv.config()

type UserTimelineResponse = {
  data: Twitter.Status[]
}

type SwabData = {
  positive_swabs: number,
  positivity_rate: string,
  swabs_24hr: number,
  date: string
}

class CovidTweeter {
  private API_URL = process.env.API_URL
  private HOSPITAL_URL = process.env.HOSPITAL_URL || ''
  private ICU_URL = process.env.ICU_URL || ''
  private FIRST_DOSE_VACCINATION_URL = process.env.VAC_ONE_URL || ''
  private SECOND_DOSE_VACCINATION_URL = process.env.VAC_TWO_URL || ''
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
      const swabData = await fetch(`${this.API_URL}/swabs/json`, { method: 'GET' })
      const vacOneResponse = await fetch(`${this.FIRST_DOSE_VACCINATION_URL}`, { method: 'GET' })
      const vacTwoResponse = await fetch(`${this.SECOND_DOSE_VACCINATION_URL}`, { method: 'GET' })
      const swabParsed = await swabData.json() as SwabData
      const casesParsed = await cases.json()
      const deathsParsed = await deaths.json()
      const hospitalCasesParsed = await hospitalCases.json()
      const icuCasesParsed = await icuCases.json()
      const vacOneData = await vacOneResponse.json()
      const vacTwoData = await vacTwoResponse.json()
      const dataFreshnessDateParsed = new Date(await dataFreshnessDate.text()).toDateString()
      const hospitalizations = hospitalCasesParsed.features[0].attributes.SUM_number_of_confirmed_covid_1_sum
      const icuAdmissions = icuCasesParsed.features[0].attributes.ncovidconf_sum
      const firstDoses = vacOneData.features[0].attributes.firstDose_max
      const secondtDoses = vacTwoData.features[0].attributes.secondDose_max

      const currDateStr = currDate.toDateString()
      const formattedDate = currDate.toLocaleDateString('en-ie', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const tweetText = `${formattedDate}\nCases: ${casesParsed}\nDeaths: ${deathsParsed}\nHospital cases: ${hospitalizations}\nICU cases: ${icuAdmissions}\n+Swabs: ${swabParsed.positive_swabs}\n+Swab rate: ${swabParsed.positivity_rate}\nSwabs in last 24hrs: ${swabParsed.swabs_24hr}\nTotal 1st dose vaccinations: ${firstDoses}\nTotal 2nd dose vaccinations: ${secondtDoses}\n#COVID19 #ireland #covid19Ireland`
      const alreadyTweeted = await this.hasTweetedToday(currDateStr)
      if (currDateStr === dataFreshnessDateParsed) {
        if (alreadyTweeted) {
          console.log('Already Tweeted today\'s stats. Skipping...')
        } else {
          await this.publishTweet(tweetText)
        }
      } else {
        console.log('Stale data. Skipping...')
      }
    } catch (err) {
      console.error(err)
    }
  }

  private hasTweetedToday = async (currDate: string) =>  {
    const params = { q: 'from:ireland_covid19', count: 1 }
    try {
      const response = (await this.twitClient.get('statuses/user_timeline', params)) as UserTimelineResponse
      const result = new Date(response.data[0].created_at).toDateString() === currDate
      return result
    } catch(err) {
      console.error(err)
    }
  }

  private publishTweet = promisify(
    (tweetText: string) => this.twitClient.post('statuses/update', { status: tweetText }, (err, data, response) => {
        if(err) console.error(`Error: ${JSON.stringify(err)}`)
        if(response) console.log(`Response: ${JSON.stringify(response)}`)
        if(data) console.log(`Data: ${JSON.stringify(data)}`)
      })
  )
}

// $ sam local invoke tweetIrishCovid19Stats
exports.handler = async () => {
  const bot = new CovidTweeter
  await bot.tweetSummary()
}
