console.time('不开启线程用时：')
let counter = 0;
//直接循环不开启多线程耗时较长
for (let i = 0; i < 20_000_000_000; i++) {
  counter++;
}
console.timeEnd('不开启线程用时：')
console.log('不开启线程用时：',counter)

