var request = require('request');
var fs = require('fs');

exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    if(args.length != 3) return;
    var from = args[0].toUpperCase();
    var to = args[1].toUpperCase();
    request('http://apilayer.net/api/live?access_key=' + fs.readFileSync("../currencylayer-key" + "") + "&currencies=" + from + "," + to, function(err, response, body) {
        if(!err && response.statusCode === 200) {
            var data = JSON.parse(body);
            if(data.success) {
                var fromCur = data.quotes["USD" + from];
                var toCur = data.quotes["USD" + to];
                var rate = toCur / fromCur;
                if(isNaN(rate)) return;
                var result = rate * args[2];
                
                var attach = [{
                    "fallback": "Fallback",
                    "color": "#F38B33",
                    "title": "Currency:",
                    "text": args[2] + " " + from + " = " + result + " " + to,
                }];
                slack._apiCall("chat.postMessage", {
                    "as_user": true,
                    "attachments": JSON.stringify(attach),
                    "channel": message.channel,
                });
            }
        }
    });
};