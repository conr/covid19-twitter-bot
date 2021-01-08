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

type VaccinationData = {
  totalVaccinations: number,
  vaccineName: string,
  source: string,
  date: string
}

class CovidTweeter {
  private API_URL = process.env.API_URL
  private HOSPITAL_URL = process.env.HOSPITAL_URL || ''
  private ICU_URL = process.env.ICU_URL || ''
  private VACCINATION_DATA_URL = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/country_data/Ireland.csv'
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
      const swabParsed = await swabData.json() as SwabData
      const casesParsed = await cases.json()
      const deathsParsed = await deaths.json()
      const hospitalCasesParsed = await hospitalCases.json()
      const icuCasesParsed = await icuCases.json()
      const vacinationDataResponse = await fetch(this.VACCINATION_DATA_URL, { method: 'GET' })
      const vacinationDataCsv = await vacinationDataResponse.text()
      const vacinationData = this.vaccinationDataFromCsv(vacinationDataCsv)
      const dataFreshnessDateParsed = new Date(await dataFreshnessDate.text()).toDateString()
      const hospitalizations = hospitalCasesParsed.features[0].attributes.SUM_number_of_confirmed_covid_1_sum
      const icuAdmissions = icuCasesParsed.features[0].attributes.ncovidconf_sum

      const currDateStr = currDate.toDateString()
      const formattedDate = currDate.toLocaleDateString('en-ie', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      const tweetText = `${formattedDate}\nCaes: ${casesParsed} 🦠\nDeaths: ${deathsParsed}\nConfirmed cases in Hospital: ${hospitalizations} 🩺\nConfirmed cases in ICU: ${icuAdmissions} 🏥\nPositive swabs: ${swabParsed.positive_swabs}\nSwab positivity rate: ${swabParsed.positivity_rate}\nSwabs in last 24 hours: ${swabParsed.swabs_24hr}\nVaccinations since ${vacinationData.date}: ${vacinationData.totalVaccinations} #COVID19 #ireland #covid19Ireland`

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

  private vaccinationDataFromCsv = (csv: string) => {
    const array = csv.split("\n").filter(el => { return el != '' })
    const rowArray = array[array.length - 1].split(",")

    const vaccinationData: VaccinationData = {
      date: rowArray[1],
      vaccineName: rowArray[2],
      totalVaccinations: +rowArray[3],
      source: rowArray[4],
    }

    return vaccinationData
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
