
var restify = require('restify');
var builder = require('botbuilder');
var axios = require('axios');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, 
    function (session) {
    
    var luisAppId = process.env.LuisAppId || 'a81d6c24-ea2f-45da-90ba-f0e6ed56ed5d';
    var luisAPIKey = process.env.LuisAPIKey || 'bd1522564df74babba3ce4fc9b43e482';
    var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

    let luisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey + '&staging=true&q=' + session.message.text;
 
    //Make http request luisModelUrl
    axios.get(luisModelUrl)
         .then(function (response) {
            let data = response.data,
                intent = data.topScoringIntent.intent,
                query = data.query;
            
            var entiry = 'none';
        
            if(data.entities != null && data.entities.length > 0){
                entity = data.entities[0].entity
            }
            let message = `Your query is: ${query}, Your Intent is to '${intent}' the ${entity} yard`;
            session.send(message);
         })
         .catch(function (error) {
            console.log(error);
         });
});