const { BlinkenTLSServer } = require('./client-server')

const server = new BlinkenTLSServer()
server.addHandler("test", (data)=>{
    console.log("test handler! " + data)
    return "tested"
})

server.addHandler("hid_light_red", (data) => { console.log("hid_light_red - " + data); return data })
server.addHandler("hid_light_green", (data) => { console.log("hid_light_green - " + data); return data })
server.addHandler("hid_light_yellow", (data) => { console.log("hid_light_yellow - " + data); return data })
server.addHandler("hid_light_orange", (data) => { console.log("hid_light_orange - " + data); return data })
server.addHandler("hid_light_off", (data) => { console.log("hid_light_off - " + data); return data })

server.addHandler("hid_light_blink", (data) => { console.log("hid_light_blink - " + data); return data })
server.addHandler("hid_light_blink_ontime", (data) => { console.log("hid_light_blink_ontime - " + data); return data })
server.addHandler("hid_light_blink_offtime", (data) => { console.log("hid_light_blink_offtime - " + data); return data })

server.start()