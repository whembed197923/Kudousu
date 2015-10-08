var exit = require("../core/exit.js");
exports.main = function(slack, message, channel, user, type, callSign, name, masters, commands, command, args) {
    var num = [args[0], args[1], args[2]];
    var final = "";
    var err;
    
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

exports.inputArgs = function() {
    return {arguments: [3], type: ["number", "number", "number"]};
}

exports.help = function() {
    return {"info": "Magic"}
}