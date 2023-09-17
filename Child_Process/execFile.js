const { execFile } = require('child_process')
execFile('ls', ['-c'], (err, stdout, stderr) => {
    if(err) {
        return console.log(err)
    }
    console.log(stdout)
    console.log(stderr)
})