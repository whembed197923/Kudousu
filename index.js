var Slack = require('slack-client');
var fs = require('fs');
var token = fs.readFileSync("../kudousu-key") + '';
var autoReconnect = true,
    autoMark = true,
    callSign = "!",
    name = "Kudousu",
    masters = ["U0AJCH48J"],
    commands = ["say", "debug"];

slack = new Slack(token, autoReconnect, autoMark)

slack.on("open", function() {
   console.log("Connected to Slack");
});

slack.on("message", function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    var type = message.type;
    var text = message.text;
    // Fixes weird bug with slack-client, kudos kurisu
    if(user === undefined) return;
    if(text === null) return;
    // Outputs only messages to console
    if(type === "message") {
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
                require("./commands/" + command + ".js").main(channel, user, type, callSign, name, masters, commands, command, args);
            } catch(e) {
                channel.send("Couldn't execute function " + command + ".")
            }
        }
    }
});

slack.login();