# Sarcastic Twitter Bot


### This bot reluctantly answer with sarcastic responses. Uses OpenAI's [GPT-3 API](https://beta.openai.com/playground/p/default-marv-sarcastic-chat) to generate the comments. Hosted on [Heroku](https://www.heroku.com/), and uses [offcial Twitter SDK](https://github.com/twitterdev/twitter-api-typescript-sdk) to interact with Twitter.


**Note:** mention `@bot_witty` in a tweet or under a tweet like below example.

<img src="https://i.imgur.com/kxUPBrm.png"  width=45% height=45%>

<img src="https://i.imgur.com/l34nAn6.png"  width=45% height=45%>

<img src="https://i.imgur.com/wZmrQY8.gif"  width=50% height=50%>


---

## Getting Stated

### Clone the repository
    $ git clone https://github.com/rohit1kumar/sarcastic-bot.git

### Install dependencies
    $ cd sarcastic-bot
    $ npm install


### Add environment variables
- Visit [OpenAI](https://beta.openai.com/) and get your API key
- Visit [Twitter](https://developer.twitter.com/en/portal/dashboard) and get get your API keys and tokens.
- Create a `.env` file in the root directory
    ```
    $ cp .env.example .env
    $ nano .env
- Now fill the corresponding values in the `.env` file

    ```
    TWITTER_BEARER_TOKEN=
    TWITTER_API_KEY=
    TWITTER_API_SECRET_KEY=
    TWITTER_ACCESS_TOKEN=
    TWITTER_ACCESS_TOKEN_SECRET=
    OPENAI_API_KEY=
    BOT_USERNAME=
    ```
    **Note:** Use the same bot username whose API key and token are being used.



### Run the bot
    $ npm start


*I have used another library to post the tweet because the official Twitter SDK was not working for me, got some error which I was not able to resolve, hence I used [twit](https://www.npmjs.com/package/twit). If you are able to resolve the issue, please feel free to open a PR.*
