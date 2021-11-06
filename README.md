# Coivd19 Twitter bot

Tweets dailys Irish stats for Covid-19.

## Deployment

`zip -r function.zip .`
`aws lambda update-function-code --function-name tweetIrishCovid19Stats --zip-file fileb://function.zip`
