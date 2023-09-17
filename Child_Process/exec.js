const { exec } = require('child_process')
//回调
exec('ls', (err, stdout, stderr) => {
    if(err) {
        console.log(stderr)
    }
    console.log(stdout)
})
//流式
const child = exec('ls')
child.stdout.on('data', (data) => {
    console.log(data)
})
child.stderr.on('data', (err) => {
    console.log(err)
})

