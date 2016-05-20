'use strict';

var request = require('request'),
    cheerio = require('cheerio');

const pantipURL = 'http://pantip.com'
var jar = request.jar();

function showObject(obj) {
  var result = "";
  for (var p in obj) {
    if( obj.hasOwnProperty(p) && obj[p] != null) {
      result += p + "=" + obj[p] + "&";
    }
  }
  return result;
}


exports.getPantipCategory = function(callback) {
    let category = [];
    request({
        url: pantipURL + '/desktop',
        method: 'GET',
        followAllRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        },
        jar: jar
    }, function(err, response, body) {
        if (err)
            callback(err)

        let $ = cheerio.load(body)

        $('div#panel1 li.submenu-room-item').each(function(i, elem) {
            if ($(this).find('a').prop('href').search('forum') >= 1) {
                category.push({
                    title: $(this).find('.title').text(),
                    description: $(this).find('.desc').text(),
                    link: $(this).find('a').prop('href')
                });
            }
        });
        callback(null, category)
    })
}

exports.getHitsTopic = function(link, callback) {
    let hitsTopic = [];
    request({
        url: pantipURL + link,
        method: 'GET',
        followAllRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        }
    }, function(err, response, body) {
        if (err)
            callback(err)

        let $ = cheerio.load(body)
        $('div.best-item div.post-item-title a').each(function(i, elem) {
            hitsTopic.push({
                id: $(this).prop('href').split('/topic/')[1],
                title: $(this).text(),
                link: $(this).prop('href'),
            })
        })
        callback(null, hitsTopic)
    })
}

exports.getPantipTrend = function(link, page, callback) {
    let trendTopic = [];
    let roomTagName = link.split('/forum/')[1];

    request({
        url: pantipURL + '/forum/topic/ajax_room_pantip_trend?p=' + page + '&r=' + roomTagName,
        method: 'GET',
        followAllRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        },
        jar: jar
    }, function(err, response, body) {
        if (err)
            callback(err)

        callback(null, body)
    });
}

exports.getTopicList = function(options, callback) {
    let postData = {
        'current_page': options.current_page,
        'dataSend[room]': options.room,
        'dataSend[topic_type][default_type]': options.default_type,
        'dataSend[topic_type][type]': options.type,
        'last_id_current_page': options.last_id_current_page,
        'thumbnailview': options.thumbnailview
    };
    let unix = new Date().getTime();

    request.post({
        url: pantipURL + '/forum/topic/ajax_json_all_topic_info_loadmore?t=' + unix,
        method: 'POST',
        form: postData,
        jar: jar,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }, function(err, response, body) {
        if (err)
            callback(err)

        callback(null, body)
    })
}

exports.getAllTags = function(url, callback) {
    let tagFactory = [];
    let tagURL;

    if (url != null)
        tagURL = pantipURL + '/tags'
    else
        tagURL = url

    request({
        url: tagURL,
        method: 'GET',
        followAllRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        }
    }, function(err, response, body) {
        if (err)
            callback(err)

        let $ = cheerio.load(body)
        $('a.tag-title').each(function(i, elem) {
            tagFactory.push({
                id: $(this).prop('id'),
                tagname: $(this).children('span').children('em').text(),
                postamount: $(this).children('span.post-amount').text(),
                url: $(this).prop('href')
            })
        })
        if (typeof $('a.next') != 'undefined')
            callback(null, tagFactory, tagURL + $('a.next').prop('href'))
        else {
            callback(null, tagFactory, null)
        }
    })
}

exports.getTopic = function(topic_id, callback) {
    let tagItems = [];
    request({
        url: pantipURL + '/topic/' + topic_id,
        method: 'GET',
        followAllRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        }
    }, function(err, response, body) {
        if (err)
            callback(err)

        let $ = cheerio.load(body)

        let topicData = $('.display-post-story').html()
        let topicTitle = $('h2.display-post-title').text()

        $('div.display-post-tag-wrapper a.tag-item').each(function(i, elem) {
            tagItems.push($(this).text())
        })

        callback(null, {
            topic_id: topic_id,
            topic_title: topicTitle,
            topic_data: topicData,
            topic_tags: tagItems
        })
    });
}

exports.getComment = function(options_params, callback) {
    let options = {
        '_': Math.round((new Date()).getTime() / 1000),
        'time': new Date().getTime(),
        'type': options_params.type,
        'tid': options_params.tid,
        'param': options_params.param,
        'expand': options_params.expand,
        'page': options_params.page,
        'parent': options_params.parent
    }
    console.log(pantipURL + '/forum/topic/render_comments?' + showObject(options));
    request({
        url: pantipURL + '/forum/topic/render_comments?' + showObject(options),
        method: 'GET',
        jar: jar,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }, function(err, response, body) {
        if (err)
            callback(err)

        callback(null, body)
    });
}
