var Slack = require('slack-client'),
    keys = require('./keys')
    pmx = require('pmx'),
    memwatch = require('memwatch-next');
var exit = require("./core/exit.js");
var autoReconnect = true,
    autoMark = true,
    callSign = "!",
    name = "projectKudousu",
    masters = ["U0AJCH48J", "WEBUI"],
    commands = ["say", "debug", "help", "meow", "hex", "test", "quit", "gc"],
    reacts = ["(╯°□°）╯︵ ┻━┻)"],
    reactSrc = [];

memwatch.on("leak", function(info) {
    console.error("Memory Leak: " + info);
    memLog("leak", info);
});

memwatch.on("stats", function(info) {
    memLog("stats", info);
});

reactSrc["(╯°□°）╯︵ ┻━┻)"] = "flip";

function memLog(type, info) {
    pmx.emit("memoryLog", {
        "type": type,
        "info": info
    });
}

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

slack = new Slack(keys.slack(), autoReconnect, autoMark);

slack.on("open", function() {
   console.log("Connected to Slack");
});

slack.on("message", function(message) {
    var me = slack.self;
    var profile = me["_client"].users[me.id].profile;
    name = profile.real_name;
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
            if(name == "Hakase") {
                var randomText = ["Give me dessert, or just", "Oh hey, a shark cloud! Stop bothering me, just", "Nano, there's a stranger bothering me... Please", "Nano will be happy to see that I've painted her daruma's other ey--- Sakamoto! I need"]
                var random = randomText[Math.floor(Math.random()*randomText.length)];
            } else {
                var random = "If you need help, do";
            }
            channel.send("I'm " + name + ". " + random + " "+ callSign + "help.");
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