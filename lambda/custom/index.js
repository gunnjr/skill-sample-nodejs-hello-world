/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const AWS = require('aws-sdk');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const FillPotIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FillPotIntent';
  },
  handle(handlerInput) {
    const speechText = 'OK.  Filling your coffee pot now.';

    // send message to S3 topic to prompt fill
    const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
    const DEST_SNS_TOPIC = "cuppyCall";

    // get SNS topic ARN based on topic name
    const createParams = {
      Name: DEST_SNS_TOPIC
    };
/*
  console.log ('about to create topic basd on name.  Params:');
  console.log(createParams);
  // Create promise and SNS service object
  var createTopicPromise = SNS.createTopic(createParams).promise();

  // Handle promise's fulfilled/rejected states
  createTopicPromise.then(
    function(data) {
      console.log("Topic ARN is " + data.TopicArn);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });



    console.log ('about to create topic basd on name.  Params:');
    console.log(createParams);
    var getTopicPromise = SNS.createTopic(createParams).promise();
    console.log ('now have the get topic promise');

    // Handle promise's fulfilled/rejected states
    getTopicPromise.then(
      function(data) {
        console.log('Get topic promise fulfilled.  Now capture resulting TpicArn');
        const topicArn = data.TopicArn;
        console.log(`Created topic: ${topicArn}`);
      }).catch(
        function(err) {
          console.log('Creating topic failed.', err);
          return handlerInput.responseBuilder
            .speak('Sorry, I wasn\'t able to communicate with the coffee pot .')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
      });
     */ 
    // Create publish parameters
    const pubParams = {
      Message: "20",
      Subject: `Invocation from AlexaSkill HelloWorld: FillPotIntent`,
      TopicArn: `arn:aws:sns:us-east-1:326542932491:cuppyCall`,
    };

    // publish to SNS topic
    console.log('About to publish to SNS. params:');
    console.log(pubParams);
    var publishTextPromise = SNS.publish(pubParams).promise();

    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
      function(data) {
        console.log(`Message ${pubParams.Message} send sent to the topic ${pubParams.TopicArn}`);
        console.log("MessageID is " + data.MessageId);
      }).catch(
        function(err) {
          console.log(`Failed sending to the topic ${pubParams.TopicArn}`, err);
          return handlerInput.responseBuilder
            .speak('Sorry, I wasn\'t able to communicate with the coffee pot .')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
      });
        
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Fill Pot', speechText)
      .getResponse();
  },

};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    FillPotIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )

  .addErrorHandlers(ErrorHandler)
  .lambda();
