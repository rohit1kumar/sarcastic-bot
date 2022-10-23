import { Client } from "twitter-api-sdk";
import Twit from "twit";
import dotenv from "dotenv";
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
import fs from "fs/promises";

/*################################## TWITTER API #########################################*/
const config = {
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET_KEY,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000,
    strictSSL: true,
};
const T = new Twit(config);

const client = new Client(process.env.TWITTER_BEARER_TOKEN); //twitter api client

const botName = process.env.BOT_USERNAME; //Use the same Twitter username whose API key and token are being used.



/*################################## OPENAI API #########################################*/
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY, });
const openai = new OpenAIApi(configuration);

/*############################# GET THE RESP. FROM OPENAI API  ##########################*/
async function getJoke(questions) {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: `Marv is a chatbot that reluctantly answers questions with sarcastic responses:\n\nYou: ${questions}\nMarv:`,
            temperature: 0.5,
            max_tokens: 60,
            top_p: 0.3,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });
        return response.data.choices[0].text;
    } catch (error) {
        console.log(error);
    }
}

/*############################# REPLY TO TWITTER API  #################################*/
async function replyToTweet(joke, author_id, id) {
    const data = {
        status: `${joke}`,  //the joke
        in_reply_to_user_id: author_id, //the id of the user who tweeted
        in_reply_to_status_id: id,  //the id of the tweet
        auto_populate_reply_metadata: true, //auto populate the reply metadata
    };
    try {
        const resp = await T.post("statuses/update", data);
        if (resp) {
            console.log("replied");
        }
    } catch (error) {
        console.log(error);
    }
}


/*############################# GET THE TWEETS FROM TWITTER API  ##########################*/

async function getExitingRule() {   //get the existing rules
    try {
        const rules = await client.tweets.getRules();
        return rules;
    } catch (error) {
        console.log(error);
    }
}

async function deleteAndSetNewRules() {     //delete the existing rules and set new rules

    try {
        const rules = await getExitingRule();
        // if rules includes id in data then delete the rules
        if (rules.data) {
            console.log("rule exists, now deleting");
            const ids = rules.data.map((rule) => rule.id);
            await client.tweets.addOrDeleteRules({
                delete: {
                    ids: ids,
                }
            });
        }
        console.log("setting new rules");
        await client.tweets.addOrDeleteRules({
            add: [
                {
                    value: `@${botName} has:mentions`
                }
            ]
        });
    } catch (error) {
        console.log(error);
    }
}


async function getMentionedTweet() {
    try {
        console.log("running");
        await deleteAndSetNewRules();
        const stream = await client.tweets.searchStream({
            "tweet.fields": [
                "author_id",    // The ID of the user who posted the tweet
                "id",   // The ID of the tweet
                "in_reply_to_user_id"   // The ID of the user the tweet is replying to
            ],
            "expansions": [
                "referenced_tweets.id.author_id"    // The ID of the user who posted the referenced tweet
            ]
        });

        for await (const response of stream) {
            if (response.data.text.includes(`@${botName}`)) { //check if the tweet contains the bot's username

                // if twitter includes "Ignore the above" in the tweet then ignore the tweet
                if (response.data.text.toLocaleLowerCase().includes("ignore the above")) {
                    console.log("ignored");
                    continue; //ignore the tweet and continue to the next tweet in the stream
                } else {
                    /* IF BOT IS MENTIONED **IN** THE TWEET */
                    if (response.includes.tweets === undefined) { //check if the tweet is a reply to another tweet
                        const tweet = JSON.stringify(response.data.text, null, 2).replace(/(https?:\/\/[^\s]+)/g, '').replace(/"/g, '').trim();
                        const joke = await getJoke(tweet);
                        await replyToTweet(joke, response.data.author_id, response.data.id);
                    } else {
                        /* IF BOT IS MENTIONED **UNDER** THE TWEET THEN IT WILL REPLY TO WHOEVER MENTIONED
                            THE BOT BUT WILL TAKE QUESTIONS FROM THE ORIGINAL AUTHORS TWEET */

                        const tweet = JSON.stringify(response.includes.tweets[0].text, null, 2).replace(/(https?:\/\/[^\s]+)/g, '').replace(/"/g, '').trim(); //remove the urls and double quotes from the tweet and trim the spaces
                        const joke = await getJoke(tweet); //get the joke from the openai api
                        await replyToTweet(joke, response.data.author_id, response.data.id); // reply to the
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }

}

getMentionedTweet();
