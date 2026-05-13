const eventBroker = require('events'); //This is the broker used in the publish-subscribe pattern

const broker = new eventBroker();

module.exports = broker;