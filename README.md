# Flow System - Client Component

## TODO
[] Need to have dependencies for 'tools' integrated or dynamically loaded.
 - How to do this with ES6 modules? Exports are static, so the export would have to be defined and then 
   an asynchronous loading of the dependencies and initializing of the exported object.  This leaves the possibility
   of race conditions.  Perhaps we can make FlowNode wait until initialization?
    - Or we can make tools a non-ES6 module...

[x] Fix 'logging' toggle 

[x] Add method to create response object from FlowMesssage

[x] Add send method on 'Flow' to simplify sending flow messages
 - [] Update example and FlowManager accordingly (Flows sending replies to should be done via the 'send' method)

[] Devise scheme for async waiting on responses to sent flow messages

[] Add logging config for FlowConnector

# Flow Client

Flow Client is the client-side component of the Flow Framework. It is designed to allow any ES6 Javascript module that extends the Flow class to be easily and seamlessly integrated into the client-side of an application built using the Flow Framework.

## Getting Started

To get started with Flow Client, you need to install it via npm:

```sh
npm install flow-client
```

Usage
After installing the Flow Client, you can import it in your project:
```
import FlowClient from 'flow-client';
```

You can then create a new instance of a FlowNode:
```
class MyFlowNode extends FlowNode {
  constructor(config = {}) {
    super(config.id || "MyFlowNode", config);
    
    this.initialize();
    this.flowRouter.addConnector(new LocalFlowConnector());
    this.flowRouter.addConnector(new WsFlowConnector('WSS-1', 'localhost', 8000));
  }
}
```

## Building the Project
To build the project, run the build script in the package.json file:
```
npm run build
```

## Contributing
Contributions are welcome. Please submit a pull request or create an issue to discuss what you would like to change.

## License
Flow Client is licensed under the MIT License. See the LICENSE file for more details.


