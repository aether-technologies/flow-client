# Flow System - Client Component

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