import FlowMessage from '../flow/flow-message.mjs';
import Flow from '../flow/flow.mjs';
import FlowRouter from '../flow/flow-router.mjs';

export default class TestClient extends Flow {
  constructor() {
    super("TestClient");
  }
  
  run(flowMessage) {
    console.log("[TestClient] Received Message :: "+JSON.stringify(flowMessage, null, 2));
  }

  static sendTestMessage() {
    const testMessage = new FlowMessage('TestClient', 'Echo', {data: 42}, 'TestClient');
    console.log("[TestClient] Sending Message :: "+JSON.stringify(testMessage, null, 2));
    (new FlowRouter()).routeFlowMessage(testMessage);
  }
}

const test_client = new TestClient();