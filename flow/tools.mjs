// ### BEGIN IMPORTS ###
// import axios from 'https://unpkg.com/axios/dist/axios.min.js';
// import uuidv4 from '';
// ### END IMPORTS ###



export const tools = {
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
