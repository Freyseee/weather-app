const subscribers = new Map();

function getSubscribers(topic) { //get subscribers
  if (!subscribers.has(topic)) subscribers.set(topic, new Set());
  return subscribers.get(topic);
}

function subscribe(topic, res) { //sub
  getSubscribers(topic).add(res);
}

function unsubscribe(topic, res) { //unsub
  getSubscribers(topic).delete(res);
}

function publish(topic, data) { //Publishes too all subscribers
  const topicSubs = getSubscribers(topic);
  for (const client of topicSubs) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

module.exports = { subscribe, unsubscribe, publish, getSubscribers };