const { fork } = require('child_process')
const path = require('path')

const child = fork(path.join(__dirname, 'child.js'))

child.on('message', (message) => {
    console.log('主进程收到消息:', message)
})
child.send({hello: 'world'})