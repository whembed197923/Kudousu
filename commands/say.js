var exit = require("../core/exit.js");
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    if(args[0].startsWith("<") && args[0].endsWith(">") && args.length > 1) {
        var splitNumber = 3;
        var toChannel = args[0].substr(splitNumber - 1, args[0].length - splitNumber);
        var text = args.join(" ").replace(new RegExp("^" + args[0] + " "), "");
        
        if(toChannel.charAt(0) == "U") {
            slack._apiCall('im.open', {
                "user": toChannel
            }, function(userData) {
                slack.getChannelGroupOrDMByID(userData.channel.id).send(text);
            });
        } else if(toChannel.charAt(0) == "C") {
            slack.getChannelGroupOrDMByID(toChannel).send(text);
        }
    } else {
        channel.send(args.join(" "));
    }
    return exit.success;
};

exports.inputArgs = function() {
    return {arguments: [], type: ["message"]};
}

exports.help = function() {
    return {"info": "Talk"}
}