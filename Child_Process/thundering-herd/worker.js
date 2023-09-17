const net = require('net')
const buf  = 'hello nodejs'
const res = ['HTTP/1.1 200 OK', 'content-length:' + buf.length].join('\r\n') + '\r\n\r\n' + buf
const data = {}

process.on('message', (message, handle) => {
    start(handle)
})

function start(server) {
    server.listen(3000)
    server.onconnection = function(err, handle) {
        const pid = process.pid
        if(!data[pid]) {
            data[pid] = 0
        }
        data[pid] ++ //每次服务 +1
        console.log('got a connection on worker, pid = %d', process.pid, data[pid])
        const socket = new net.Socket({
            handle: handle
        })
        socket.readable = socket.writable = true
        socket.end(res)
    }
}