import BaseFlowNode from './flow/base-flow-node.mjs'
import WsFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';

import FlowRouter from './flow/flow-router.mjs';
import FlowManager from './flow/flow-manager.mjs';
import FlowMonitor from './flow/flow-monitor.mjs';
import FlowConnector from './flow/flow-connector.mjs';
import FlowMessage from './flow/flow-message.mjs';
import Flow from './flow/flow.mjs';

import { tools } from './flow/tools.mjs';

export default class FlowNode extends BaseFlowNode {
  constructor(config = {}) {
    super(config.id || "FlowNode", config);
    
    this.initialize();
    this.flowRouter.addConnector(new LocalFlowConnector());
    //TODO: Add logic to dynamically add connectors based on config
    this.flowRouter.addConnector(new WsFlowConnector(config.wss_id || 'WSS-1', config.wss_addr || 'localhost', config.wss_port || 8000));
  }
}

export {
  Flow,
  FlowMessage,
  FlowConnector,
  LocalFlowConnector,
  WsFlowConnector,
  FlowRouter,
  FlowManager,
  FlowMonitor,
  BaseFlowNode,
  tools
}
