const WebSocket = require("ws");

const FORTNOX_WS_ENDPOINT = "wss://ws.fortnox.se/topics-v1";
const FORTNOX_ADD_TENANTS_COMMAND = "add-tenants-v1";
const FORTNOX_ADD_TOPICS_COMMAND = "add-topics-v1";
const FORTNOX_SUBSCRIBE_COMMAND = "subscribe-v1";
const FORTNOX_TOPICS = ["customers", "projects", "invoices", "vouchers"];

/**
 * Create socket
 */
const ws = new WebSocket(FORTNOX_WS_ENDPOINT);

/**
 * Sends subribe message, intitiating the subscription
 */
const sendSubscribeMessage = () =>
  ws.send(JSON.stringify({ command: FORTNOX_SUBSCRIBE_COMMAND }));

/**
 * Formats and sends add topic message
 */
const sendAddTopicsMessage = async () => {
  const addTopicsMessage = {
    command: FORTNOX_ADD_TOPICS_COMMAND,
    topics: FORTNOX_TOPICS.map((topic) => ({ topic })),
  };

  ws.send(JSON.stringify(addTopicsMessage));
};

/**
 * Formats and sends add tenants message
 */
const sendAddTenantsMessage = () => {
  const initialTenantsMessage = {
    command: FORTNOX_ADD_TENANTS_COMMAND,
    clientSecret: process.env.FORTNOX_CLIENT_SECRET,
    accessTokens: [process.env.FORTNOX_ACCESS_TOKEN],
  };

  ws.send(JSON.stringify(initialTenantsMessage));
};

/**
 * Handles incoming messages
 */
const handleMessage = async (message) => {
  const { data } = message;
  const parsedData = JSON.parse(data);

  if (parsedData.result === "error") {
    console.error(data);
    return;
  }

  console.info("FORTNOX WEBSOCKET Message", { data: parsedData });

  switch (parsedData.response) {
    case FORTNOX_ADD_TENANTS_COMMAND:
      sendAddTopicsMessage();
      break;
    case FORTNOX_ADD_TOPICS_COMMAND:
      sendSubscribeMessage();
      break;
  }
};

/**
 * Add event listeners
 */
ws.addEventListener("open", sendAddTenantsMessage);
ws.addEventListener("error", console.error);
ws.addEventListener("close", console.error);
ws.addEventListener("message", handleMessage);
