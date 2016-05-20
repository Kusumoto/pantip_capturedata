const Hapi = require('hapi');
const inert = require('inert');
const server = new Hapi.Server();
var route = require('./route');

server.connection({
    port: 8080
});

server.register(inert, (err) => {

    if (err) {
        throw err;
    }

    server.route(route);

    server.start(() => {
        console.log('[%s] : Pantip Extractor Web Service running at: %s', new Date(), server.info.uri);
    });
});
