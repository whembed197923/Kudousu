var Slack = require('slack-client');
var fs = require('fs');
var token = fs.readFileSync("../kudousu-key") + "";
var exit = require("./core/exit.js");
var autoReconnect = true,
    autoMark = true,
    callSign = "!",
    name = "Kudousu",
    masters = ["U0AJCH48J"],
    commands = ["say", "debug", "help", "meow", "hex", "test"],
    reacts = ["(╯°□°）╯︵ ┻━┻)"],
    reactSrc = [];

reactSrc["(╯°□°）╯︵ ┻━┻)"] = "flip";

function error(channel, command, e) {
    channel.send("Couldn't run command '" + command + "'. Here's what I know: ```" + e + "```");
}

slack = new Slack(token, autoReconnect, autoMark)

slack.on("open", function() {
   console.log("Connected to Slack");
});

slack.on("message", function(message) {
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
    if(text.startsWith(callSign)) {
        // Argument Parsing
        var raw = text.split(" ");
        var command = raw[0].replace(new RegExp("^" + callSign), "");
        if(raw.length == 1) {
            var args = [];
        } else {
            var args = raw.join(" ").replace(new RegExp("^" + raw[0] + " "), "").split(" ");
        }
        
        // Command system
        if(text === callSign) {
            channel.send("Yes? If you need help, you could use " + callSign + "help.")
        } else if(commands.indexOf(command) != -1) {
            try {
                var ret = require("./commands/" + command + ".js").main(slack, message, channel, user, type, callSign, name, masters, commands, command, args);
                if(ret !== exit.success) {
                    error(channel, command, ret);
                } else {
                    console.log(ret);
                }
            } catch(e) {
                error(channel, command, e);
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

slack.login();