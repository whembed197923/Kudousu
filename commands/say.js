var exit = require("../core/exit.js");
var util = require('util');
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    if(masters.indexOf(user.id) != -1) {
        if(args[0].startsWith("<") && args[0].endsWith(">") && args.length > 1) {
            var splitNumber = 3;
            var toChannel = args[0].substr(splitNumber - 1, args[0].length - splitNumber);
            var text = args.join(" ").replace(new RegExp("^" + args[0] + " "), "");
            var userData = {"fail": true};
            
            slack._apiCall('im.open', {
                "user": toChannel
            }, function(data) {
                done(data);
            });

            function done(data) {
                var userData = data;
                if(userData.fail != true) {
                    if(userData.ok == false) {
                        slack.getChannelGroupOrDMByID(toChannel).send(text);
                    } else {
                        slack.getChannelGroupOrDMByID(userData.channel.id).send(text);
                    }
                }
            }
        } else {
            channel.send(args.join(" "));
        }
    } else {
        channel.send("You're not my master, " + user.name + ". You don't get to tell me what to say.");
    }
    return exit.success;
};