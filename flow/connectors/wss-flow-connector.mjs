import { tools } from '../tools.mjs';
import FlowConnector from '../flow-connector.mjs';
import FlowMessage from '../flow-message.mjs';

export default class WsFlowConnector extends FlowConnector {
    constructor(id, host, port, config = {}) {
      super(id, config);
      this.ws = new tools.ws(`ws://${host}:${port}`);
      this.connected = false;

      this.ws.onmessage = (data) => {
        // Deserialize the received data into a FlowMessage
        let flowMessage = Object.assign(new FlowMessage(), JSON.parse(data.data));
        if(this.connected) {
          this.receiveMessage(flowMessage);
        } else {
          this.initialize(flowMessage);
        }
      };
    }

    sendMessage(flowMessage) {
      // Serialize the FlowMessage into a JSON string
      let data = JSON.stringify(flowMessage);
      if (this.connected || this.ws.readyState === this.ws.OPEN) {
        if(this.logging) console.log('[WSS][info] Sending message to server.');
        this.ws.send(data);
      }
    }
    initialize(flowMessage) {
      this.id = flowMessage.content;
      this.connected = true;
      const initMessage = this.getInitMessageString();
      this.ws.send(initMessage);
      console.log("[WssFlowConnector] Initialized connector "+this.id);
    }
    getInitMessageString() {
      const initMessageObject = {
        id: "00000000-0000-0000-0000-000000000000",
        gid: "00000000-0000-0000-0000-000000000000",
        origin: this.id,
        sender: this.id,
        recipient: this.id,
        content: this.id,
        time: "undefined",
        hops: 0
      };
      return JSON.stringify(initMessageObject);
    }
}
