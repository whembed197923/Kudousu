exports.main = function(channel, user, type, callSign, name, masters, commands, command, args) {
    channel.send("The commands available are: " + commands.join(", ") + ".");
};