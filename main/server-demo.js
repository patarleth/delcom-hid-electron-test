const tls = require('tls')
const fs = require('fs')

const homedir = require('os').homedir();

const connOpts = {
    key: fs.readFileSync(homedir + '/delcom/private.key'),
    cert: fs.readFileSync(homedir + '/delcom/certificate.cert')
}

const server = tls.createServer(connOpts, (socket) => {
    console.log('connected:', socket.remoteAddress)
    socket.write('yo\n')

    socket.on('data', (msg) => {
        console.log('<---:', msg.toString())
        socket.write("back-at-cha\n")
    })
    
    socket.on('end', () => {
        console.log('bye felicia')
    })
    
    socket.on('error', (err) => {
        console.error('uh.... wat? ', err)
    })
})

server.listen(8000, "0.0.0.0", () => {
    console.log('running - port 8000')
})