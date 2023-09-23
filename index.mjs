import BaseFlowNode from './flow/base-flow-node.mjs'
import WsFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';

import FlowRouter from './flow/flow-router.mjs';
import FlowManager from './flow/flow-manager.mjs';
import FlowMonitor from './flow/flow-monitor.mjs';
import FlowConnector from './flow/flow-connector.mjs';
import FlowMessage from './flow/flow-message.mjs';
import Flow from './flow/flow.mjs';

export default class FlowNode extends BaseFlowNode {
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

export {
  Flow,
  FlowMessage,
  FlowConnector,
  FlowRouter,
  FlowManager,
  FlowMonitor
}
