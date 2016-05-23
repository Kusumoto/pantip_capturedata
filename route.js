'use strict';

var Joi = require('joi');
var pantip = require('./pantip_extractor')

module.exports = [{
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        console.log('[%s] : Access to /', new Date());
        reply({
            'statusCode': 200,
            'result': 'Pantip Extractor API'
        })
    }
}, {
    method: 'GET',
    path: '/forumslist',
    handler: function(request, reply) {
        console.log('[%s] : Access to /room', new Date());
        pantip.getPantipCategory(function(err, result) {
            reply({
                'statusCode': 200,
                'result': result
            })
        })
    }
}, {
    method: 'GET',
    path: '/forum/{room_name}',
    handler: function(request, reply) {
        console.log('[%s] : Access to /forum/%s', new Date(), request.params.room_name);
        pantip.getHitsTopic('/forum/' + request.params.room_name, function(err, hitsTopic) {
            pantip.getPantipTrend('/forum/' + request.params.room_name, 1, function(err, trendTopic) {
                reply({
                    'statusCode': 200,
                    'result': {
                        'forum_name': request.params.room_name,
                        'hitsTopic': hitsTopic,
                        'trendTopic': trendTopic
                    }
                })
            })
        });
    }
}, {
    method: 'GET',
    path: '/forum',
    handler: function(request, reply) {
        console.log('[%s] : Access to /forum', new Date());
        pantip.getHitsTopic('/forum', function(err, hitsTopic) {
            pantip.getPantipTrend('/forum', 1, function(err, trendTopic) {
                reply({
                    'statusCode': 200,
                    'result': {
                        'forum_name': 'all',
                        'hitsTopic': hitsTopic,
                        'trendTopic': trendTopic
                    }
                })
            })
        });
    }
}, {
    method: 'POST',
    path: '/topiclist',
    handler: function(request, reply) {
        console.log('[%s] : Access to /topiclist', new Date());
        var options = {
            'current_page': request.payload.current_page,
            'room': request.payload.room,
            'default_type': request.payload.default_type,
            'type': request.payload.type,
            'last_id_current_page': request.payload.last_id_current_page,
            'thumbnailview': request.payload.thumbnailview
        }
        pantip.getTopicList(options, function(err, topicList) {
            reply({
                'statusCode': 200,
                'result': {
                    topicList
                }
            })
        });
    }
}, {
    method: 'GET',
    path: '/topic/{topic_id}',
    handler: function(request, reply) {
        console.log('[%s] : Access to /topic/%s', new Date(), request.params.topic_id);
        pantip.getTopic(request.params.topic_id, function(err, topicData) {
            reply({
                'statusCode': 200,
                'result': topicData
            })
        })
    }
}, {
    method: 'POST',
    path: '/topic/{topic_id}/comment',
    handler: function(request, reply) {
        console.log('[%s] : Access to /topic/%s/comment', new Date(), request.params.topic_id);
        var options = {
            'type': request.payload.type,
            'tid': request.params.topic_id,
            'param': request.payload.param,
            'expand': request.payload.expand,
            'page': request.payload.page,
            'parent': request.payload.parent
        }
        pantip.getComment(options, function(err, commentData) {
            reply({
                'statusCode': 200,
                'result': commentData
            })
        })
    }
}]
