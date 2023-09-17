process.nextTick(() => {
    console.log('nextTick1')
})
process.nextTick(() => {
    console.log('nextTick2')
})
setImmediate(() => {
    console.log('Immediate1')
    process.nextTick(() => {
        console.log('nextTick3')
    })
})
process.nextTick(() => {
    console.log('nextTick4')
})
setImmediate(() => {
    console.log('Immediate2')
})

/**
nextTick1
nextTick2
nextTick4
Immediate1
nextTick3
Immediate2
 */
