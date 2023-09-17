const net = require('net')
const path = require('path')
const { fork } = require('child_process')

const workers = []
for(let i = 0; i < 4; i++) {
    workers.push(fork(path.join(__dirname, 'worker.js')))
}
const handle = net._createServerHandle('0.0.0.0', 3000)
handle.listen(3000)
handle.onconnection = (err, handle) => {
    const worker = workers.pop()
    worker.send({}, handle)
    workers.unshift(worker)
}