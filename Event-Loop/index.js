const fs = require('fs')
const path = require('path')
//在poll阶段首先检查定时器队列
setTimeout(() => {
    console.log('Timeout1')
    setTimeout(() => {
        console.log('Timeout3')
    },10)
    //在Node事件循环阶段切换（清空定时器队列，fs队列）时候执行
    setImmediate(() => {
        console.log('Immediate2')
    })
    //每一个任务队列小任务同步执行后执行，类似微任务Promise，但执行优先级高于Promise
    process.nextTick(() => {
        console.log('nextTick')
    })
    //每一个任务队列小任务同步执行后执行（在process.nextTick之后执行）
    Promise.resolve().then(() => {
        console.log('Promise')
    })
    for(let i = 0; i < 4000000000; i++) {
        // console.log('Timeout1同步执行')
    }
})

fs.readFile(path.join(__dirname, 'node.txt'), 'utf8',(err, data) => {console.log('ReadFile')})

setTimeout(() => {
    console.log('Timeout2')
})

console.log('同步执行')

setImmediate(() => {
    console.log('Immediate1')
})

/**
同步执行
Timeout1
nextTick
Promise
Timeout2
Immediate1
Immediate2
Timeout3
ReadFile
 */

