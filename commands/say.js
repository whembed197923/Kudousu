exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    if(masters.indexOf(user.id) != -1) {
        channel.send(args.join(" "));
    } else {
        channel.send("You're not my master, " + user.name + ". You don't get to tell me what to say.")
    }
};