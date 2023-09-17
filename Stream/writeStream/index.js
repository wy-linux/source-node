const EventEmitter = require('events');
const fs = require('fs');
class WriteStream extends EventEmitter {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'w';
        this.encoding = options.encoding || 'utf8';
        this.mode = options.mode || 0o666;
        this.autoClose = options.autoClose || true;
        this.start = options.start || 0;
        this.highWaterMark = options.highWaterMark || 16 * 1024;
        this.len = 0; // 用于维持有多少数据没有被写入到文件中的
        this.needDrain = false;
        this.cache = [];
        this.writing = false; // 用于标识是否是第一次写入
        this.offset = this.start; // 偏移量
        this.open();
    }
    open() {
        fs.open(this.path, this.flags, this.mode, (err, fd) => {
            this.fd = fd;
            this.emit('open', fd)
        })
    }
    clearBuffer() { 
        let data = this.cache.shift();
        if (data) {
            this._write(data.chunk, data.encoding, data.cb);
        } else {
            this.writing = false;
            if (this.needDrain) {
                //只有当我们写入的数据达到了highWaterMark，并且写入队列被清空后才会触发drain事件
                this.emit('drain')
            }
        }
    }
    write(chunk, encoding = this.encoding, cb = () => {}) { 
        chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        this.len += chunk.length;
        //写入数据是否达到highWaterMark
        let flag = this.len < this.highWaterMark;
        this.needDrain = !flag;
        let userCb = cb;
        cb = () => {
            userCb();
            this.clearBuffer(); // 清空缓存buffer逻辑
        }
        //第一次写入为写入操作
        if (!this.writing) {
            this.writing = true;
            this._write(chunk, encoding, cb);
        //后续写入均为添加队列操作
        } else {
            this.cache.push({
                chunk,
                encoding,
                cb
            });
        }
        return flag
    }
    _write(chunk, encoding, cb) {
        if (typeof this.fd !== 'number') {
            return this.once('open', () => this._write(chunk, encoding, cb))
        }
        fs.write(this.fd, chunk, 0, chunk.length, this.offset, (err, written) => {
            this.offset += written; 
            this.len -= written; // 把缓存的个数减少
            cb(); 
        });
    }
}

module.exports = WriteStream
