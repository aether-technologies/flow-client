import BaseFlowNode from './flow/base-flow-node.mjs'
import WsFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';

export default class ClientFlowNode extends BaseFlowNode {
  constructor() {
    super('TestClient0');
    
    this.initialize();
    this.flowRouter.addConnector(new LocalFlowConnector());
    this.flowRouter.addConnector(new WsFlowConnector('WSS-1', 'localhost', 8000));
  }

  test() {
    TestClient.sendTestMessage();
  }
}
