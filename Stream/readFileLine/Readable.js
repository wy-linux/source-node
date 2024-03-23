const { Readable } = require('stream');
const fs = require('fs');

// 自定义可读流实现文件字符单行读取
class ContinuousLineReader extends Readable {
    constructor(filePath, options = {}) {
        super(options);
        this.filePath = filePath;
        this.fileDescriptor = null;
        this.buffer = Buffer.alloc(options.highWaterMark || 64 * 1024); // 用于存储读取的数据
        this.bufferOffset = 0
        this.bytesLength = this.buffer.length - this.bufferOffset
        this.bufLength = this.buffer.length
        this.bytesRead = 0; // 已读取的字节数
        this.lineDelimiter = Buffer.from('\n'); // 行分隔符
        this.eof = false; // 标记文件是否读取完毕
    }

    _read() {
        if (this.eof) {
            this.push(null); // 文件已经读取完毕，推送 null 表示结束
            return;
        }

        if (!this.fileDescriptor) {
            fs.open(this.filePath, 'r', (err, fd) => {
                if (err) {
                    return this.emit('error', err);
                }
                this.fileDescriptor = fd;
                this._read(); // 继续读取
            });
            return;
        }
        this.bytesLength = this.buffer.length - this.bufferOffset
        // 从文件中读取数据
        fs.read(this.fileDescriptor, this.buffer, this.bufferOffset, this.bytesLength, this.bytesRead, (err, bytesRead) => {
            if (err) {
                return this.emit('error', err);
            }
            // 如果读取到数据
            if (bytesRead > 0) {
                this.bytesRead += bytesRead;

                // 将缓冲区中的数据按行分割并推送到流中
                let lineStart = 0;
                let lineEnd;
                while ((lineEnd = this.buffer.indexOf(this.lineDelimiter, lineStart)) !== -1) {
                    this.push(this.buffer.slice(lineStart, lineEnd));
                    lineStart = lineEnd + 1;
                }
                this.bufLength = this.bufferOffset + bytesRead
                // 将未处理的数据移到缓冲区的起始位置
                this.buffer.copy(this.buffer, 0, lineStart, this.bufLength);
                this.bufferOffset = this.bufLength - lineStart
                this.buffer.fill(0, this.bufferOffset) 
            } else {
                // 如果没有读取到数据，说明已经到达文件末尾
                this.eof = true;

                // 如果缓冲区中仍有数据，则将其推送到流中
                if (this.buffer.length > 0) {
                    this.push(this.buffer);
                }

                // 关闭文件描述符
                fs.close(this.fileDescriptor, (err) => {
                    if (err) {
                        return this.emit('error', err);
                    }
                    this.fileDescriptor = null;
                });
            }
        });
    }
}

// 使用示例
const filePath = './node.txt';

// 创建可读流实例
const reader = new ContinuousLineReader(filePath, {
    highWaterMark: 60
});

// 监听数据事件，处理每一行数据
reader.on('data', function(line) {
    console.log(line.toString()); // 输出每一行的内容
});

// 监听结束事件
reader.on('end', function() {
    console.log('文件读取完毕');
});

// 监听关闭事件
reader.on('close', function() {
    console.log('文件流关闭');
});

// 监听错误事件
reader.on('error', function(err) {
    console.error('发生错误:', err);
});
