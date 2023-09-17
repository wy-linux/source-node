const EventEmitter = require('events');
const fs = require('fs')
class ReadStream extends EventEmitter {
    constructor(path, options = {}) {
        super();
        this.path = path;
        this.flags = options.flags || 'r';
        this.encoding = options.encoding || null;
        this.autoClose = options.autoClose || true;
        this.start = options.start || 0;
        this.end = options.end;
        this.highWaterMark = options.highWaterMark || 64 * 1024
        this.flowing = false; // pause resume方法
        this.open(); 
        this.on('newListener', function(type) {
            if (type === 'data') {
                this.flowing = true;
                this.read();
            }
        })
        this.offset = this.start;
    }
    pipe(ws) {
        this.on('data', (data) => {
            let flag = ws.write(data);
            if (!flag) {
                this.pause();
            }
        })
        ws.on('drain', () => {
            this.resume();
        })
    }
    resume() {
        if (!this.flowing) {
            this.flowing = true;
            this.read();
        }
    }
    pause() {
        this.flowing = false;
    }
    read() {
        //绑定事件递归调用，确保fd存在 
        if (typeof this.fd !== 'number') {
            return this.once('open', () => this.read())
        }
        let howMutchToRead = this.end ? Math.min(this.end - this.offset + 1, this.highWaterMark) : this.highWaterMark;
        const buffer = Buffer.alloc(howMutchToRead);
        fs.read(this.fd, buffer, 0, howMutchToRead, this.offset, (err, bytesRead) => {
            if (bytesRead) {
                this.offset += bytesRead;
                this.emit('data', buffer.slice(0, bytesRead));
                if (this.flowing) { // 用于看是否递归读取
                    this.read();
                }
            } else {
                this.emit('end');
                this.destroy();
            }
        })
    }
    destroy(err) {
        if (err) {
            this.emit('error', err);
        }
        if (this.autoClose) {
            fs.close(this.fd, () => this.emit('close'))
        }
    }
    open() {
        fs.open(this.path, this.flags, (err, fd) => {
            if (err) {
                return this.destroy(err)
            }
            this.fd = fd;
            this.emit('open', fd)
        })
    }
}

module.exports = ReadStream