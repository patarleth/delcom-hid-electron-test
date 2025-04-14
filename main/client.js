const { BlinkenTLSClient } = require('./client-server')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const client = new BlinkenTLSClient()
client.addHandler("test", (data)=>{
    console.log("test handler back at cha! " + data )
    console.log("test handler back at cha! " + data )
    console.log("test handler back at cha! " + data )
})

client.send("test", "it")