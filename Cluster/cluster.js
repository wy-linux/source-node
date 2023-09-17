const cluster  = require('cluster')
const http = require('http')
const CPUNums = require('os').cpus().length

if(cluster.isMaster) {
    for(let i = 0; i < CPUNums; i++) {
        cluster.fork()
    }
    cluster.on('fork', (worker) => {
        console.log('worker pid: ', worker.process.pid)
    })
    cluster.on('listening', (worker) => {
        console.log('主进程fork一个worker进程进行http服务，pid: ', worker.process.pid)
    })
    for(const id in cluster.workers) {
        cluster.workers[id].on('message', (message) => {
            console.log('收到子进程信息：',message)
        })
    }
    //exit 事件
    cluster.on('disconnect', (worker) => {
        console.log('工作进程关闭：', worker.process.pid)
        cluster.fork() //有进程退出时候，再重新创建一个进程，保证进程总数不变
    })
} else {
    http.createServer((req, res) => {
        try {
            res.writeHead(200)
            res.end('hello world\n')      
        } catch (err) {
            process.disconnect() //断开与master进程的连接
        }
    }).listen(8000)

    process.send(process.pid)
}