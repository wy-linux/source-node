const net = require('net')
const { fork } = require('child_process')
const path = require('path')
const handle = net._createServerHandle('0.0.0.0', 3000)
for(let i = 0; i < 4; i++) {
    console.log('fork', i)
    fork(path.join(__dirname, 'worker.js')).send({}, handle)
}