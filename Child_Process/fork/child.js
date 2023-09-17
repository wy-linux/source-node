process.on('message', (message) => {
    console.log('子进程收到消息:', message)
})
process.send({foo: 'bar'})