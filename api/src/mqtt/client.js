const mqtt = require('mqtt');

const BROKER   = process.env.MQTT_BROKER   || 'mqtts://1e207622805f4e098c7ee1503aed4068.s1.eu.hivemq.cloud';
const USERNAME = process.env.MQTT_USERNAME || 'CoffeeHive';
const PASSWORD = process.env.MQTT_PASSWORD || 'X@ABH9Rbya9XjxY';

let client = null;

function connect() {
  client = mqtt.connect(BROKER, {
    port               : 8883,
    username           : USERNAME,
    password           : PASSWORD,
    protocol           : 'mqtts',
    rejectUnauthorized : true,
    reconnectPeriod    : 5000,
    connectTimeout     : 30000,
    clientId           : `smart-coffee-api-${Date.now()}`,
  });

  client.on('connect', () => {
    console.log('Connected to HiveMQ Cloud');
  });

  client.on('error', (err) => {
    console.error('MQTT error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('MQTT reconnecting...');
  });

  client.on('offline', () => {
    console.log('MQTT offline');
  });
}

function publish(machineId, payload) {
  if (!client || !client.connected) {
    console.warn('MQTT not connected — cannot publish');
    return;
  }
  const topic = `boubyan/machines/${machineId}/commands`;
  client.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
    if (err) console.error('MQTT publish error:', err.message);
    else console.log(`Published to ${topic}:`, payload.type);
  });
}

function getClient() {
  return client;
}

module.exports = { connect, publish, getClient };
