var exit = require("../core/exit.js");
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    var num = args[0].split(",");
    var final = "";
    var err;
    
    if(num.length > 3 || num.length < 2) return "Invalid RGB";
    
    num.forEach(function(n) {
        if(isNaN(n) || n > 255 || n < 0 || num === "" || num === undefined) {
            err = "Invalid RGB";
        } else {
            var hex = Number(n).toString(16).toUpperCase();
            if(hex.length == 1) final = final + 0 + hex;
            else final = final + hex;
            return;
        }
    });
    
    if(err) return err;
    
    channel.send("#" + final);
    return exit.success;
};