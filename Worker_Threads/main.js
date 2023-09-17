const { Worker } = require("worker_threads");
const path = require('path')

function createWorker() {
    return new Promise(function (resolve, reject) {
        const worker = new Worker(path.join(__dirname, "./worker.js"), {
            workerData: { thread_count: THREAD_COUNT },
        });
        worker.on("message", (data) => {
            resolve(data);
        });
        worker.on("error", (err) => {
            reject(err);
        });
    });
}

const THREAD_COUNT = 4;
const workerPromises = [];
//创建4个worker线程
for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
}
console.time('开启四个线程用时：')
Promise.all(workerPromises)
    .then((thread_results) => {
        console.timeEnd('开启四个线程用时：')
        const result = thread_results.reduce((pre, cur) => pre + cur)
        console.log('开启四个线程运算结果：',result)
    })
