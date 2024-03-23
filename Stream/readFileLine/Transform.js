const { Transform } = require("stream");

// 自定义转换流实现文件字符单行读取
class LineReader extends Transform {
	constructor() {
		super({
			// 写入方向
			writableObjectMode: false,
			// 读出方向
			readableObjectMode: true
		});
		this.cacheStr = ""
	}
	_transform(chunk, encoding, next) {
		this.cacheStr += chunk.toString();//没有toString会自动转换
		const lines = this.cacheStr.split("\n")
		this.cacheStr = lines.pop();
		lines.forEach(line => this.push(line))
		// this.push或next二选一传递chunk
		next()
	}
	// 最后一个chunk结束后
	_flush(callback) {
		this.cacheStr.split("\n").forEach(line => {
			this.push(line)
		});
		callback()
	}
};

const fs = require("fs");
fs.createReadStream("./node.txt")
	.pipe(new LineReader())
	.on("data", line => {
		console.log(line)
	});