import { tools } from './tools.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowManager from './flow-manager.mjs';
import FlowRouter from './flow-router.mjs';
import FlowConnector from '../flow-connector.mjs';
import { tools } from '../tools.mjs';
import FlowConnector from '../flow-connector.mjs';
import FlowMessage from '../flow-message.mjs';
import FlowRouter from './flow-router.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowRouter from './flow-router.mjs';
import { tools } from './tools.mjs';
import { tools } from './tools.mjs';
import FlowManager from './flow-manager.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowMessage from './flow-message.mjs';
import FlowManager from "./flow-manager.mjs";
import { tools } from './tools.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowManager from './flow-manager.mjs';
import FlowRouter from './flow-router.mjs';
import FlowConnector from '../flow-connector.mjs';
import { tools } from '../tools.mjs';
import FlowConnector from '../flow-connector.mjs';
import FlowMessage from '../flow-message.mjs';
import FlowRouter from './flow-router.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowRouter from './flow-router.mjs';
import { tools } from './tools.mjs';
import { tools } from './tools.mjs';
import FlowManager from './flow-manager.mjs';
import FlowMonitor from './flow-monitor.mjs';
import FlowMessage from './flow-message.mjs';
import FlowManager from "./flow-manager.mjs";
import BaseFlowNode from './flow/base-flow-node.mjs'
import WsFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';
import BaseFlowNode from './flow/base-flow-node.mjs'
import WsFlowConnector from './flow/connectors/wss-flow-connector.mjs';
import LocalFlowConnector from './flow/connectors/local-flow-connector.mjs';
import FlowRouter from './flow/flow-router.mjs';
import FlowManager from './flow/flow-manager.mjs';
import FlowMonitor from './flow/flow-monitor.mjs';
import FlowConnector from './flow/flow-connector.mjs';
import FlowMessage from './flow/flow-message.mjs';
import Flow from './flow/flow.mjs';


// Flow Node interface
  constructor(id_=null) {
    this.id = id_ || tools.uuidv4();
    this.flowManager = null;
    this.flowMonitor = null;
    this.flowRouter = null;
  }
  
  initialize() {
    this.flowMonitor = new FlowMonitor();
    this.flowManager = new FlowManager();
    this.flowRouter = new FlowRouter();
  }
}

  constructor() {
    super('localnode');
    this.local = true;
    this.connected = true;
  }
  sendMessage(message) {
    this.receiveMessage(message);
  }
}


    constructor(id, host, port) {
      super(id);
      this.logging = true;
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


// Flow Connector interface
  constructor(id) {
    // A unique identifier for this connector
    // This needs to match the other side of this connector
    this.id = id;
    // Reference to the flow router (to send messages back)
    this.flowRouter = new FlowRouter();
    // List of flows available on this connector
    this.flowList = [];
    this.connected = false;
  }
  // Receives a message from the flow router and sends it to the flow manager on the other side
  sendMessage(flowMessage) {
    throw new Error('sendMessage has not been implemented!');
  }

  handleFlowDiscoveryMessage(flowDiscoveryMessage) {
    if(flowDiscoveryMessage.recipient == this.id) {
      console.log(`[${this.id}][info] FlowDiscoveryMessage :: `+JSON.stringify(flowDiscoveryMessage, null, 2));
      this.flowRouter.handleFlowDiscoveryMessage(flowDiscoveryMessage, this);
    } else {
      console.log(`[${this.id}][info] Forwarding FlowDiscoveryMessage for '${flowDiscoveryMessage.recipient}'`);
      this.flowRouter.routeFlowMessage(flowDiscoveryMessage);
    }
  }
  
  receiveMessage(message) {
    console.log(`[${this.id}][info] Received message with id '${message.id}`);
    if (!this.flowRouter) {
      throw new Error(`[${this.id}][error] No FlowRouter set for this connector`);
    }
    if (message.discovery) {
      this.handleFlowDiscoveryMessage(message);
    } else {
      this.flowRouter.forwardMessageToManager(message);
    }
  }

  isConnected() {
    return this.connected;
  }
}
// export default IFlowConnector;


    static instance;
    flows = {};
    constructor() {
      if (FlowManager.instance) {
        return FlowManager.instance;
      }
      FlowManager.instance = this;
      this.flowMonitor = new FlowMonitor();
      this.flowRouter = new FlowRouter();
      this.logging = true;
      this.updateFlowMonitor();
    }
    
    async handleFlowMessage(message) {
      try {
        if(this.logging) console.log(`[FlowManager][info] Handling message '${message.id}' from ${message.origin}:${message.sender} for ${message.recipient}`);
        let flow = this.getFlow(message.recipient);
        if (!flow) {
          console.log(`[FlowManager][info] Flow ${message.recipient} not found.  Returning message.`);
          return message;
        }
        let response = await flow.run(message);
        if(response) {
          response.gid = message.gid;
        }
        return response;
      } catch (e) {
        console.error('[FlowManager][error] Error handling Flow message', e);
        return { error: e.message };
      }
    }
    
    getFlow(id) {
      return this.flows[id];
    }

    // Method to add a Flow
    addFlow(flowName, flowInstance) {
      if (!this.flows[flowName]) {
        this.flows[flowName] = flowInstance;
        console.log(`[FlowManager][info] Flow '${flowName}' added.`);
        this.updateFlowMonitor();
        this.updateFlowRouter();
      } else {
        console.log(`[FlowManager][info] Flow '${flowName}' already exists.`);
      }
    }

    // Method to remove a Flow
    removeFlow(flowName) {
      if (this.flows[flowName]) {
        delete this.flows[flowName];
        console.log(`[FlowManager][info] Flow '${flowName}' removed.`);
        this.updateFlowMonitor();
      } else {
        console.log(`[FlowManager][info] Flow '${flowName}' doesn't exist.`);
      }
    }

    updateFlowMonitor() {
      console.debug(`[FlowManager][debug] Updating Flow Monitor`);
      this.flowMonitor.setAvailableFlowsAndUsage(this.flows);
    }
    updateFlowRouter() {
      console.debug(`[FlowManager][debug] Updating Flow Router`);
      this.flowRouter.connectors.forEach(connector => this.flowRouter.sendFlowDiscoveryMessage(connector));
    }
}


    constructor(sender, recipient, content, origin) {
        this.id = tools.uuidv4();
        this.gid = tools.uuidv4();
        this.origin = origin;
        this.sender = sender;
        this.recipient = recipient;
        this.content = content;
        this.time = new Date().toISOString();
        this.hops = 0;
    }
}

// export default FlowMessage;



    constructor() {
      if(FlowMonitor.exists) {
        return FlowMonitor.instance;
      }
      this.logging = false;
      this.nodeUsageData = {};
      this.availableFlowsAndUsage = {};
      FlowMonitor.instance = this;
      FlowMonitor.exists = true;
    }

    // update usage data for a specific node
    updateNodeUsageData(nodeId) {
        // To get cpuUsage, maybe you want to use os.loadavg() or other method
        this.nodeUsageData[nodeId] = {
            cpuInfo: tools.os.cpus(),
            loadavg: tools.os.loadavg(),
            memoryUsage: tools.os.totalmem() - tools.os.freemem()
        };
    }
    // get usage data for a specific node
    getNodeUsageData(nodeId) {
        return this.nodeUsageData[nodeId];
    }

    setAvailableFlowsAndUsage(flowsAndUsage) {
        this.availableFlowsAndUsage = flowsAndUsage;
    }
    getAvailableFlowsAndUsage() {
      //TODO: Eventually, this should be a map of flows and current usage of each
      return Object.keys(this.availableFlowsAndUsage);
    }
}


      constructor(id_=null) {
        if(FlowRouter.exists) {
          return FlowRouter.instance
        }
        this.id = id_ || 'FlowRouter';
        this.logging = true;
        this.max_hops = 5; // Another configurable item.
        this.connectors = [];
        this.connection_timeout = 60*1000; // one minute
        this.flowsMap = new Map();
        this.reverseFlowsMap = new Map();
        this.flowManager = new FlowManager();
        this.flowMonitor = new FlowMonitor();
        FlowRouter.instance = this;
        FlowRouter.exists = true;
        
        this.recentDiscoveryThreads = new Map();
        // Add an interval that cleans up everything in this.recentDiscoveryThreads older than 15 minutes.
        setInterval(() => {
          const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
          for (let [key, value] of this.recentDiscoveryThreads) {
            if (value < fifteenMinutesAgo) {
              this.recentDiscoveryThreads.delete(key);
            }
          }
        }, 60 * 1000);  // run every minute
      }
  setConnectors(connectors) {
    this.connectors.forEach(connector => this.addConnector(connector));
  }
  // Add a single connector
  addConnector(connector) {
    connector.flowRouter = this;
    this.connectors.push(connector);
    if(!connector.local) this.sendFlowDiscoveryMessage(connector);
  }
  // Remove a specific connector
  removeConnector(connector) {
    const index = this.connectors.indexOf(connector);
    if (index !== -1) {
      this.connectors.splice(index, 1);
    }
  }
  // receive flow message from chatbox or bot
  routeFlowMessage(message) {
    if(message.hops >= this.max_hops) {
      console.log(`[FlowRouter][warning] Message '${message.id}' has been passed around ${message.hops} times.  Discarding.`);
      return;
    }
    // evaluate load distribution
    let connector = this.evaluateLoadDistribution(message);
    // Check if connector exists before attempting to send message
    if (connector) {
      message.hops++;
      if(this.logging) console.log(`[FlowRouter][info] Routing message '${message.id}' from ${message.origin}:${message.sender} for ${message.recipient} to ${connector.id}`);
      connector.sendMessage(message);
    } else {
      console.log("No available connectors to send message");
    }
  }
  
  // decide which connector to use based on some condition
  // (i.e., load distribution in this case)
  evaluateLoadDistribution(message) {
    if (this.connectors.length == 0) {
      return null;
    }
    
    // get available flows and usage from flowMonitor
    let availableFlows = this.flowMonitor.getAvailableFlowsAndUsage();
    let connector;
  
    if (availableFlows.includes(message.recipient)) {
      connector = this.connectors.find(item => item.id === "localnode");
    } else {
      this.flowsMap.forEach(function (value, key, map) {
        if(value.includes(message.recipient)) {
          connector = this.connectors.find(item => item.id === key);
        }
      }.bind(this));
    }
  
      
    if(!connector) {
      throw new Error("[FlowRouter][error] No suitable connector found for the recipient");
    }
    return connector;
  }

  // Forward a message from a connector to the flow manager
  //TODO: Add queues to prevent stack overflow
  async forwardMessageToManager(flowMessage) {
    console.log(`[FlowRouter][info] Forwarding message '${flowMessage.id}' to manager`);
    let responseMessage = await this.flowManager.handleFlowMessage(flowMessage);
    if(responseMessage) this.routeFlowMessage(responseMessage);
  }

  async sendFlowDiscoveryMessage(connector, replyId=null) {
    const timeout = new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out');
      }, this.connection_timeout)
    });

    const connectorConnected = new Promise((resolve, reject) => {
      if(connector.connected){
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if(connector.connected){
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });

    try {
      await Promise.race([timeout, connectorConnected]);
      const discoveryMessage = new FlowDiscoveryMessage(this, connector);
      if(replyId) discoveryMessage.gid = replyId;
      console.log(`[FlowRouter][info] Sending FlowDiscoveryMessage ${discoveryMessage.id}`);
      connector.sendMessage(discoveryMessage);
      this.recentDiscoveryThreads[discoveryMessage.gid] = (new Date()).getTime();
    } catch (error) {
      console.error(error);
      return;
    }
  }
  async handleFlowDiscoveryMessage(message, connector) {
     console.log(`[FlowRouter][info] Received FlowDiscoveryMessage from ${connector.id}. Handling...`);
     if (!this.flowsMap.has(connector.id)) {
         this.flowsMap.set(connector.id, []);
     }
     const availableFlows = message.content;
     this.updateFlowMap(connector.id, availableFlows);
     if( !Object.keys(this.recentDiscoveryThreads).includes(message.gid) ) {
       this.recentDiscoveryThreads[message.gid] = (new Date()).getTime();
       await this.sendFlowDiscoveryMessage(connector, message.gid);
     }
  }

  updateFlowMap(connectorId, newFlows) {
    const oldFlows = this.flowsMap.get(connectorId) || [];
    this.flowsMap.set(connectorId, newFlows);

    newFlows.forEach(flow => {
      if (!this.reverseFlowsMap.has(flow))  {
        this.reverseFlowsMap.set(flow, []);
      }
      if (!this.reverseFlowsMap.get(flow).includes(connectorId)) {
        this.reverseFlowsMap.get(flow).push(connectorId);
      }
    });

    oldFlows.forEach(flow => {
      if (!newFlows.includes(flow)) {
        const index = this.reverseFlowsMap.get(flow).indexOf(connectorId);
        if (index !== -1) {
          this.reverseFlowsMap.get(flow).splice(index, 1);
        }
      }
    });
  }

}

class FlowDiscoveryMessage extends FlowMessage {
  constructor(flowRouter, flowConnector) {
    super(flowRouter.id, flowConnector.id, flowRouter.flowMonitor.getAvailableFlowsAndUsage(), flowRouter.id);
    this.discovery = true;
  }
}

    constructor(id) {
        this.id = id;
        // create an instance of FlowManager
        const flowManager = new FlowManager();
        // add the instance to the FlowManager
        flowManager.addFlow(id, this);
    }
    run(flowMessage) {
        // implement this method in subclass
        throw new Error("Abstract method!");
    }
}

// ### BEGIN IMPORTS ###
// import axios from 'https://unpkg.com/axios/dist/axios.min.js';
// import uuidv4 from '';
// ### END IMPORTS ###



  axios: axios,
  uuidv4: uuid.v4,
  ws: WebSocket,
  os: {
    cpus: function() { return undefined; },
    loadavg: function() { return undefined; },
    totalmem: function() { return undefined; },
    freemem: function() { return undefined; }
  }
};


// Flow Node interface
  constructor(id_=null) {
    this.id = id_ || tools.uuidv4();
    this.flowManager = null;
    this.flowMonitor = null;
    this.flowRouter = null;
  }
  
  initialize() {
    this.flowMonitor = new FlowMonitor();
    this.flowManager = new FlowManager();
    this.flowRouter = new FlowRouter();
  }
}

  constructor() {
    super('localnode');
    this.local = true;
    this.connected = true;
  }
  sendMessage(message) {
    this.receiveMessage(message);
  }
}


    constructor(id, host, port) {
      super(id);
      this.logging = true;
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


// Flow Connector interface
  constructor(id) {
    // A unique identifier for this connector
    // This needs to match the other side of this connector
    this.id = id;
    // Reference to the flow router (to send messages back)
    this.flowRouter = new FlowRouter();
    // List of flows available on this connector
    this.flowList = [];
    this.connected = false;
  }
  // Receives a message from the flow router and sends it to the flow manager on the other side
  sendMessage(flowMessage) {
    throw new Error('sendMessage has not been implemented!');
  }

  handleFlowDiscoveryMessage(flowDiscoveryMessage) {
    if(flowDiscoveryMessage.recipient == this.id) {
      console.log(`[${this.id}][info] FlowDiscoveryMessage :: `+JSON.stringify(flowDiscoveryMessage, null, 2));
      this.flowRouter.handleFlowDiscoveryMessage(flowDiscoveryMessage, this);
    } else {
      console.log(`[${this.id}][info] Forwarding FlowDiscoveryMessage for '${flowDiscoveryMessage.recipient}'`);
      this.flowRouter.routeFlowMessage(flowDiscoveryMessage);
    }
  }
  
  receiveMessage(message) {
    console.log(`[${this.id}][info] Received message with id '${message.id}`);
    if (!this.flowRouter) {
      throw new Error(`[${this.id}][error] No FlowRouter set for this connector`);
    }
    if (message.discovery) {
      this.handleFlowDiscoveryMessage(message);
    } else {
      this.flowRouter.forwardMessageToManager(message);
    }
  }

  isConnected() {
    return this.connected;
  }
}
// export default IFlowConnector;


    static instance;
    flows = {};
    constructor() {
      if (FlowManager.instance) {
        return FlowManager.instance;
      }
      FlowManager.instance = this;
      this.flowMonitor = new FlowMonitor();
      this.flowRouter = new FlowRouter();
      this.logging = true;
      this.updateFlowMonitor();
    }
    
    async handleFlowMessage(message) {
      try {
        if(this.logging) console.log(`[FlowManager][info] Handling message '${message.id}' from ${message.origin}:${message.sender} for ${message.recipient}`);
        let flow = this.getFlow(message.recipient);
        if (!flow) {
          console.log(`[FlowManager][info] Flow ${message.recipient} not found.  Returning message.`);
          return message;
        }
        let response = await flow.run(message);
        if(response) {
          response.gid = message.gid;
        }
        return response;
      } catch (e) {
        console.error('[FlowManager][error] Error handling Flow message', e);
        return { error: e.message };
      }
    }
    
    getFlow(id) {
      return this.flows[id];
    }

    // Method to add a Flow
    addFlow(flowName, flowInstance) {
      if (!this.flows[flowName]) {
        this.flows[flowName] = flowInstance;
        console.log(`[FlowManager][info] Flow '${flowName}' added.`);
        this.updateFlowMonitor();
        this.updateFlowRouter();
      } else {
        console.log(`[FlowManager][info] Flow '${flowName}' already exists.`);
      }
    }

    // Method to remove a Flow
    removeFlow(flowName) {
      if (this.flows[flowName]) {
        delete this.flows[flowName];
        console.log(`[FlowManager][info] Flow '${flowName}' removed.`);
        this.updateFlowMonitor();
      } else {
        console.log(`[FlowManager][info] Flow '${flowName}' doesn't exist.`);
      }
    }

    updateFlowMonitor() {
      console.debug(`[FlowManager][debug] Updating Flow Monitor`);
      this.flowMonitor.setAvailableFlowsAndUsage(this.flows);
    }
    updateFlowRouter() {
      console.debug(`[FlowManager][debug] Updating Flow Router`);
      this.flowRouter.connectors.forEach(connector => this.flowRouter.sendFlowDiscoveryMessage(connector));
    }
}


    constructor(sender, recipient, content, origin) {
        this.id = tools.uuidv4();
        this.gid = tools.uuidv4();
        this.origin = origin;
        this.sender = sender;
        this.recipient = recipient;
        this.content = content;
        this.time = new Date().toISOString();
        this.hops = 0;
    }
}

// export default FlowMessage;



    constructor() {
      if(FlowMonitor.exists) {
        return FlowMonitor.instance;
      }
      this.logging = false;
      this.nodeUsageData = {};
      this.availableFlowsAndUsage = {};
      FlowMonitor.instance = this;
      FlowMonitor.exists = true;
    }

    // update usage data for a specific node
    updateNodeUsageData(nodeId) {
        // To get cpuUsage, maybe you want to use os.loadavg() or other method
        this.nodeUsageData[nodeId] = {
            cpuInfo: tools.os.cpus(),
            loadavg: tools.os.loadavg(),
            memoryUsage: tools.os.totalmem() - tools.os.freemem()
        };
    }
    // get usage data for a specific node
    getNodeUsageData(nodeId) {
        return this.nodeUsageData[nodeId];
    }

    setAvailableFlowsAndUsage(flowsAndUsage) {
        this.availableFlowsAndUsage = flowsAndUsage;
    }
    getAvailableFlowsAndUsage() {
      //TODO: Eventually, this should be a map of flows and current usage of each
      return Object.keys(this.availableFlowsAndUsage);
    }
}


      constructor(id_=null) {
        if(FlowRouter.exists) {
          return FlowRouter.instance
        }
        this.id = id_ || 'FlowRouter';
        this.logging = true;
        this.max_hops = 5; // Another configurable item.
        this.connectors = [];
        this.connection_timeout = 60*1000; // one minute
        this.flowsMap = new Map();
        this.reverseFlowsMap = new Map();
        this.flowManager = new FlowManager();
        this.flowMonitor = new FlowMonitor();
        FlowRouter.instance = this;
        FlowRouter.exists = true;
        
        this.recentDiscoveryThreads = new Map();
        // Add an interval that cleans up everything in this.recentDiscoveryThreads older than 15 minutes.
        setInterval(() => {
          const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
          for (let [key, value] of this.recentDiscoveryThreads) {
            if (value < fifteenMinutesAgo) {
              this.recentDiscoveryThreads.delete(key);
            }
          }
        }, 60 * 1000);  // run every minute
      }
  setConnectors(connectors) {
    this.connectors.forEach(connector => this.addConnector(connector));
  }
  // Add a single connector
  addConnector(connector) {
    connector.flowRouter = this;
    this.connectors.push(connector);
    if(!connector.local) this.sendFlowDiscoveryMessage(connector);
  }
  // Remove a specific connector
  removeConnector(connector) {
    const index = this.connectors.indexOf(connector);
    if (index !== -1) {
      this.connectors.splice(index, 1);
    }
  }
  // receive flow message from chatbox or bot
  routeFlowMessage(message) {
    if(message.hops >= this.max_hops) {
      console.log(`[FlowRouter][warning] Message '${message.id}' has been passed around ${message.hops} times.  Discarding.`);
      return;
    }
    // evaluate load distribution
    let connector = this.evaluateLoadDistribution(message);
    // Check if connector exists before attempting to send message
    if (connector) {
      message.hops++;
      if(this.logging) console.log(`[FlowRouter][info] Routing message '${message.id}' from ${message.origin}:${message.sender} for ${message.recipient} to ${connector.id}`);
      connector.sendMessage(message);
    } else {
      console.log("No available connectors to send message");
    }
  }
  
  // decide which connector to use based on some condition
  // (i.e., load distribution in this case)
  evaluateLoadDistribution(message) {
    if (this.connectors.length == 0) {
      return null;
    }
    
    // get available flows and usage from flowMonitor
    let availableFlows = this.flowMonitor.getAvailableFlowsAndUsage();
    let connector;
  
    if (availableFlows.includes(message.recipient)) {
      connector = this.connectors.find(item => item.id === "localnode");
    } else {
      this.flowsMap.forEach(function (value, key, map) {
        if(value.includes(message.recipient)) {
          connector = this.connectors.find(item => item.id === key);
        }
      }.bind(this));
    }
  
      
    if(!connector) {
      throw new Error("[FlowRouter][error] No suitable connector found for the recipient");
    }
    return connector;
  }

  // Forward a message from a connector to the flow manager
  //TODO: Add queues to prevent stack overflow
  async forwardMessageToManager(flowMessage) {
    console.log(`[FlowRouter][info] Forwarding message '${flowMessage.id}' to manager`);
    let responseMessage = await this.flowManager.handleFlowMessage(flowMessage);
    if(responseMessage) this.routeFlowMessage(responseMessage);
  }

  async sendFlowDiscoveryMessage(connector, replyId=null) {
    const timeout = new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out');
      }, this.connection_timeout)
    });

    const connectorConnected = new Promise((resolve, reject) => {
      if(connector.connected){
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if(connector.connected){
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });

    try {
      await Promise.race([timeout, connectorConnected]);
      const discoveryMessage = new FlowDiscoveryMessage(this, connector);
      if(replyId) discoveryMessage.gid = replyId;
      console.log(`[FlowRouter][info] Sending FlowDiscoveryMessage ${discoveryMessage.id}`);
      connector.sendMessage(discoveryMessage);
      this.recentDiscoveryThreads[discoveryMessage.gid] = (new Date()).getTime();
    } catch (error) {
      console.error(error);
      return;
    }
  }
  async handleFlowDiscoveryMessage(message, connector) {
     console.log(`[FlowRouter][info] Received FlowDiscoveryMessage from ${connector.id}. Handling...`);
     if (!this.flowsMap.has(connector.id)) {
         this.flowsMap.set(connector.id, []);
     }
     const availableFlows = message.content;
     this.updateFlowMap(connector.id, availableFlows);
     if( !Object.keys(this.recentDiscoveryThreads).includes(message.gid) ) {
       this.recentDiscoveryThreads[message.gid] = (new Date()).getTime();
       await this.sendFlowDiscoveryMessage(connector, message.gid);
     }
  }

  updateFlowMap(connectorId, newFlows) {
    const oldFlows = this.flowsMap.get(connectorId) || [];
    this.flowsMap.set(connectorId, newFlows);

    newFlows.forEach(flow => {
      if (!this.reverseFlowsMap.has(flow))  {
        this.reverseFlowsMap.set(flow, []);
      }
      if (!this.reverseFlowsMap.get(flow).includes(connectorId)) {
        this.reverseFlowsMap.get(flow).push(connectorId);
      }
    });

    oldFlows.forEach(flow => {
      if (!newFlows.includes(flow)) {
        const index = this.reverseFlowsMap.get(flow).indexOf(connectorId);
        if (index !== -1) {
          this.reverseFlowsMap.get(flow).splice(index, 1);
        }
      }
    });
  }

}

class FlowDiscoveryMessage extends FlowMessage {
  constructor(flowRouter, flowConnector) {
    super(flowRouter.id, flowConnector.id, flowRouter.flowMonitor.getAvailableFlowsAndUsage(), flowRouter.id);
    this.discovery = true;
  }
}

    constructor(id) {
        this.id = id;
        // create an instance of FlowManager
        const flowManager = new FlowManager();
        // add the instance to the FlowManager
        flowManager.addFlow(id, this);
    }
    run(flowMessage) {
        // implement this method in subclass
        throw new Error("Abstract method!");
    }
}

// ### BEGIN IMPORTS ###
// import axios from 'https://unpkg.com/axios/dist/axios.min.js';
// import uuidv4 from '';
// ### END IMPORTS ###



  axios: axios,
  uuidv4: uuid.v4,
  ws: WebSocket,
  os: {
    cpus: function() { return undefined; },
    loadavg: function() { return undefined; },
    totalmem: function() { return undefined; },
    freemem: function() { return undefined; }
  }
};


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

