const fs = require('fs')
const path = require('path')

console.time('file')
fs.readFile(path.join(__dirname, 'node.txt'), 'utf8',(err, data) => {
    console.timeEnd('file')
})

//file: 3.172ms