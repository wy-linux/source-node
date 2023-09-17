const { spawn } = require('child_process')
const child = spawn('ls', ['-c'], {
    encoding:'utf8'
})
child.stdout.on('data', (data) => {
    console.log(data)
})
child.on('close',(code) => {
    console.log(code)
})