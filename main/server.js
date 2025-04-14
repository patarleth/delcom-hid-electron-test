const { BlinkenTLSServer } = require('./client-server')

const server = new BlinkenTLSServer()
server.addHandler("test", (data)=>{
    console.log("test handler! " + data)
    console.log("test handler! " + data)
    console.log("test handler! " + data)
    console.log("test handler! " + data)
    console.log("test handler! " + data)
    return "tested"
})
server.start()