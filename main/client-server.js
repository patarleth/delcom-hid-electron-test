const { Lock } = require('semaphore-async-await')
const tls = require('tls')
const fs = require('fs')
const homedir = require('os').homedir();

class BlinkenTLSServer {
    static options(privateKey, certificate) {
        if (!privateKey) {
            privateKey = fs.readFileSync(homedir + '/delcom/private.key')
        }
        if (!certificate) {
            certificate = fs.readFileSync(homedir + '/delcom/certificate.cert')
        }
        return {
            key: privateKey,
            cert: certificate
        }
    }

    handlers = {}

    constructor(host = "0.0.0.0", port = 8000, welcomeMsg = "yo", options) {
        if (options) {
            this.options = options
        } else {
            this.options = BlinkenTLSServer.options()
        }
        this.host = host
        this.port = port

        var msgHandlers = this.handlers

        console.log("creating server")
        this.server = tls.createServer(this.options, (socket) => {
            this.socket = socket
            console.log('connected:', socket.remoteAddress)
            socket.write(welcomeMsg + '\n')

            socket.on('data', (msg) => {
                var msgStr = msg.toString()
                var msgObj = JSON.parse(msgStr)
                var key = msgObj.key
                console.log('<---:', msgStr)

                var handler = msgHandlers[key]
                var objBack = {
                    key: "unknown",
                    data: key
                }

                if (handler) {
                    objBack.key = key
                    objBack.data = handler(msgObj.data)
                }
                
                socket.write(JSON.stringify(objBack))
            })

            socket.on('end', () => {
                console.log('bye felicia')
            })

            socket.on('error', (err) => {
                console.error('uh.... wat? ', err)
            })
        })
    }

    addHandler(key, fn) {
        this.handlers[key] = fn
    }

    start() {
        this.server.listen(this.port, this.host, () => {
            console.log('running - port 8000 - ' + this.host)
        })
    }

    stop() {
        if (this.socket) {
            this.server.destroy()
        }
    }
}

class BlinkenTLSClient {
    static options(port, host, key, certificate) {
        if (!port) {
            port = 8000
        }
        if (!host) {
            host = process.env["SSL_DELCOM_HOST"]
        }
        if (!key) {
            key = fs.readFileSync(homedir + '/delcom/private.key')
        }
        if (!certificate) {
            certificate = fs.readFileSync(homedir + '/delcom/certificate.cert')
        }
        var result = {
            port: port,
            host: host,
            key: key,
            cert: certificate
        }
        //console.log("BlinkenTLSClient options() " + JSON.stringify(result))
        return result
    }

    handlers = {}

    constructor(options) {
        if (options) {
            this.options = options
        } else {
            this.options = BlinkenTLSClient.options()
        }
    }

    addHandler(key, fn) {
        this.handlers[key] = fn
    }

    async send(key, data) {
        var msg = { key: key, data: data }
        var msgToSend = JSON.stringify(msg)

        const lock = new Lock(1)
        await lock.acquire()

        var response = null
        var connected = false

        const client = tls.connect(this.options, async () => {
            /* the console log will always print Unauthorized since the cert I'm using
             * is self signed.  The following is from the docs on client.authorized  
             * 
             * This property is `true` if the peer certificate was signed by one of the CAs
             * specified when creating the `tls.TLSSocket` instance, otherwise `false`.
             * @since v0.11.4
             * console.log('connected:', client.authorized ? 'Authorized' : 'Unauthorized');
             */
            client.write(msgToSend + '\n')
        })

        client.on('data', (msg) => {
            if (connected === false) {
                console.log('welcome msg:', msg.toString())
                connected = true
            } else {
                response = JSON.parse(msg)
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

        if (response) {
            var handler = this.handlers[response.key]
            if (handler) {
                handler(response.data)
            }
        }
        return response
    }
}

exports.BlinkenTLSServer = BlinkenTLSServer
exports.BlinkenTLSClient = BlinkenTLSClient