const cluster  = require('cluster')
const http = require('http')
const CPUNums = require('os').cpus().length

if(cluster.isMaster) {
    for(let i = 0; i < CPUNums; i++) {
        cluster.fork()
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log('worker', worker.process.pid, 'died')
    })
} else {
    http.createServer((req, res) => {
        res.writeHead(200)
        res.end('hello world\n')
    }).listen(8000)
}