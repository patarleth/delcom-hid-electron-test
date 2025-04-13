const {Lock} = require('semaphore-async-await')

const tls = require('tls')
const fs = require('fs')

const homedir = require('os').homedir();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
host = process.env["SSL_DELCOM_HOST"]
console.log('server host - ' + host)

const connOpts = {
    port: 8000,
    host: host,
    key: fs.readFileSync(homedir + '/delcom/private.key'),
    cert: fs.readFileSync(homedir + '/delcom/certificate.cert')
}

var sendMessage = async (msgToSend) => {
    const lock = new Lock(1)
    await lock.acquire()

    var response = null
    var connected = false

    const client = tls.connect(connOpts, async () => {
        /* the console log will always print Unauthorized since the cert I'm using
         * is self signed.  The following is from the docs on client.authorized  
         * 
         * This property is `true` if the peer certificate was signed by one of the CAs
         * specified when creating the `tls.TLSSocket` instance, otherwise `false`.
         * @since v0.11.4
         */        
        console.log('connected:', client.authorized ? 'Authorized' : 'Unauthorized');
        client.write(msgToSend + '\n')
    })

    client.on('data', (msg) => {
        response = msg
        if(connected === false) {
            console.log('welcome msg:', msg.toString())
            connected = true
        } else {
            console.log('<---:', msg.toString())
            lock.release()
        }
    })

    client.on('end', () => {
        console.log('bye felicia')
    })

    client.on('error', (err) => {
        console.error('uh.... wat? ', err)
        client.destroy()
    })
    console.log("before lock.wait")
    await lock.wait()
    console.log("after lock.wait")
    client.destroy()
    return response
}

console.log( "well here goes: " + sendMessage("this may work") )