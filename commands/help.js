var exit = require("../core/exit.js");
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    
    var cmds = [];
    
    commands.forEach(function(command) {
        try {
            var cmdModule = require("./" + command + ".js"),
                cmdArgs = cmdModule.inputArgs().arguments,
                cmdType = cmdModule.inputArgs().type,
                cmd = cmdModule.help().info + ": " + callSign + command;
            if(cmdArgs.indexOf(0) != -1) {
                cmds.push(cmd);
            } else {
                cmds.push(cmd + " <" + cmdType.join("> <") + ">");
            }
        } finally {
            // Do nothing
        }
    });
    
    channel.send("The commands available are: \n" + cmds.join("\n"));
    return exit.success;
};

exports.inputArgs = function() {
    return {arguments: [0], type: []};
}

exports.help = function() {
    return {"info": "Displays help"}
}