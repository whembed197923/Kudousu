var Slack = require('slack-client'),
    fs = require('fs'),
    pmx = require('pmx');
var token = fs.readFileSync("../kudousu-key") + "";
var exit = require("./core/exit.js");
var autoReconnect = true,
    autoMark = true,
    callSign = "!",
    name = "Kudousu",
    masters = ["U0AJCH48J", "WEBUI"],
    commands = ["say", "debug", "help", "meow", "hex", "test", "quit"],
    reacts = ["(╯°□°）╯︵ ┻━┻)"],
    reactSrc = [];

reactSrc["(╯°□°）╯︵ ┻━┻)"] = "flip";

function error(channel, command, e) {
    channel.send("Couldn't run command '" + command + "'. Here's what I know: ```" + e + "```");
    console.error("Failed to run command '" + command + "'. Error log:\n" + e);
}

function usage(callSign, channel, command, cmdModule) {
    var cmdInput = cmdModule.inputArgs();
    var cmdArgs = cmdInput.arguments;
    var usageString = "Usage: ";
    if(cmdArgs.indexOf(0) != -1) {
        channel.send(usageString + callSign + command)
    } else {
        var cmdType = cmdInput.type;
        channel.send(usageString + callSign + command + " <" + cmdType.join("> <") + ">")
    }
}

function commandLog(isSuccess, user, command, args, error) {
    pmx.emit("commandUsed", {
        "success": isSuccess,
        "user": user.name,
        "command": command,
        "args": args,
        "error": error
    });
}

slack = new Slack(token, autoReconnect, autoMark);

slack.on("open", function() {
   console.log("Connected to Slack");
});

slack.on("message", function(message) {
    var me = slack.self;
    var profile = me["_client"].users[me.id].profile;
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var type = message.type;
    var text = message.text;
    if(type === "message") {
        // Fixes weird bug with slack-client, kudos kurisu
        if(user === undefined) return;
        if(text === null) return;
        console.log("[" + channel.name + "]" + user.name + ": " + text);
    }
    
    // Command check
    var isDM = false;
    if(!text.startsWith(callSign) && message.channel.charAt(0) == "D") isDM = true;
    
    if((text.startsWith(callSign) || isDM == true) && me.id != message.user) {
        // Argument Parsing
        var raw = text.split(" ");
        if(isDM != true) {
            var command = raw[0].substr(callSign.length);
        } else {
            var command = raw[0];
        }
        
        // Command system
        var args = [];
        
        if(raw.length != 1 && (reacts.indexOf(text) || commands.indexOf(command))) {
            var args = raw.join(" ").substr(raw[0].length + 1).split(" ");
        }
        if(text === callSign) {
            channel.send("Hi, I'm " + profile.real_name + ". If you need help, you could use " + callSign + "help.")
        } else if(commands.indexOf(command) != -1) {
            try {
                var cmdModule = require("./commands/" + command + ".js"),
                    cmdInput = cmdModule.inputArgs(),
                    cmdArgs = cmdInput.arguments;
                
                if(cmdArgs.length == 0 || cmdArgs.indexOf(args.length) != -1) {
                    var ret = cmdModule.main(slack, message, channel, user, type, callSign, name, masters, commands, command, args);
                    if(ret !== exit.success) {
                        error(channel, command, ret);
                        commandLog(false, user, command, args, ret);
                    } else {
                        commandLog(true, user, command, args, "None");
                    }
                    
                } else {
                    usage(callSign, channel, command, cmdModule);
                    commandLog(false, user, command, args, "Improper Arguments");
                }
            } catch(e) {
                error(channel, command, e);
                commandLog(false, user, command, args, e);
            }
        }
    } else if(reacts.indexOf(text) != -1) {
        try {
            require("./reacts/" + reactSrc[text] + ".js").main(slack, message, channel, user, type, callSign, name, masters, commands, command, args);
        } catch(e) {
            channel.send("Couldn't react to '" + text + "'. Here's what I know: ```" + e + "```");
        }
    }
});

pmx.action('Restart', function(reply) {
    var user = {"id": "WEBUI", "name": "WebUI"},
        command = "quit",
        cmdModule = require("./commands/quit.js"),
        args = [];
    
    var ret = cmdModule.main(slack, {"channel": "#development"}, "", user, "message", callSign, name, masters, commands, command, args);
    if(ret !== exit.success) {
        commandLog(false, user, command, args, ret);
        reply(ret);
    } else {
        commandLog(true, user, command, args, "None");
        reply("Done");
    }
});

slack.login();