const http = require('http');
const app = require('./app');
const bsInit = require('./binServer');
const server = http.createServer(app);

server.listen(process.env.PORT || 3000, () => {
    console.log('Server runs on port: ' + server.address().port);
});

bsInit();
