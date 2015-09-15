var exit = require("../core/exit.js");
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    channel.send("Nothing here, mooove along.");
    return exit.success;
};
