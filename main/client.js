const { BlinkenTLSClient } = require('./client-server')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const client = new BlinkenTLSClient()
client.addHandler("hid_light_red", (data) => {
    console.log("hid_light_red! ON")
})
client.addHandler("hid_light_off", (data) => {
    console.log("hid_light_off! ON")
})

const blink = () => {
    client.send("hid_light_blink", "on")
}

const color = (color) => {
    client.send("hid_light_" + color, "on")
}

const on = (t) => {
    client.send("hid_light_blink_ontime", t)
}
const off = (t) => {
    client.send("hid_light_blink_offtime", t)
}
const cliCmds = []
process.argv.slice(2).forEach( (val, index, array) => {
    var keyVal = val.split("=")
    //console.log(index + ': ' + val + " - " + keyVal[0]);
    switch(keyVal[0]) {
        case "color":
            if(keyVal.length > 1) {
                cliCmds.push( () => { color(keyVal[1]) } )
            }
            break
        case "blink":
            cliCmds.push( () => { blink() } )
            break
        case "on-time":
            if(keyVal.length > 1) {
                cliCmds.push( () => { on(keyVal[1]) } )
            }
            break
        case "off-time":
            if(keyVal.length > 1) {
                cliCmds.push( () => { off(keyVal[1]) } )
            }
            break
    }
});

cliCmds.forEach((val,index,array) => {
    val()
})