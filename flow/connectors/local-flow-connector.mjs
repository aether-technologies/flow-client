import FlowConnector from '../flow-connector.mjs';

export default class LocalFlowConnector extends FlowConnector {
  constructor(config = {}) {
    super('localnode', config);
    this.local = true;
    this.connected = true;
  }
  sendMessage(message) {
    this.receiveMessage(message);
  }
}
