'use strict';

const express = require('express');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const dialogflow = require('@google-cloud/dialogflow');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

dotenv.config();

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID;
const SESSION_ID = uuidv4(); // Generate a unique session ID for each user
const GEN_API_KEY = process.env.GEMINI_API_KEY;

// Path to your service account key file
// const KEYFILE_PATH = path.join(__dirname, 'service-account-key.json');

// // Create a new session client
// const sessionClient = new dialogflow.SessionsClient({ keyFilename: KEYFILE_PATH });
// const sessionPath = sessionClient.projectAgentSessionPath(PROJECT_ID, SESSION_ID);

const genAI = new GoogleGenerativeAI(GEN_API_KEY);

// const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
// });


app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

const server = app.listen(3000, () => {
    console.log(`Server is running on port: ${server.address().port}`);
});

const io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.on('chat message', async (text) => {
        // const request = {
        //     session: sessionPath,
        //     queryInput: {
        //         text: {
        //             text: text,
        //             languageCode: 'en-US',
        //         },
        //     },
        // };

        try {
            // const responses = await sessionClient.detectIntent(request);
            // const result = responses[0].queryResult;
            // const aiText = result.fulfillmentText;

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            });
            console.log(text)
            const chatSession = model.startChat({
                
                parts: [
                    { text: `Please provide a short answer not exceeding 25 words for the following query: ${text}. If the answer is long, provide only the main points.` },
                ]
            });
            const botresult = await chatSession.sendMessage(text);
            const botText = botresult.response.text();


            socket.emit('bot reply', botText); // Send the result back to the browser!
        } catch (error) {
            console.log(error);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile('index.html');
});