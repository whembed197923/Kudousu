var exit = require("../core/exit.js");
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    channel.send("hi");
    return exit.success;
};

exports.inputArgs = function() {
    return {arguments: [0], type: []};
}

exports.help = function() {
    return {"info": "Test"}
}