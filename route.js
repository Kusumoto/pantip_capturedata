var Joi = require('joi');
var pantip = require('./pantip_extractor')

module.exports = [{
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('Pantip Extractor Web Service.')
    }
}, {
    method: 'GET',
    path: '/room',
    handler: function(request, reply) {
        pantip.getPantipCategory(function(err, result) {
            reply(result)
        })
    }
}, {

}]
