const { Readable } = require("node:stream");
const fs = require("node:fs");

class FileReadStream extends Readable {
	constructor({ highWaterMark, fileName }) {
		super({ highWaterMark });
		this.fileName = fileName;
		this.fd = null;
	}

	_construct(callback) {
		fs.open(this.fileName, "r", (err, fd) => {
			if (err) return callback(err);
			this.fd = fd;
			callback();
		});
	}

	_read(size) {
		const buff = Buffer.alloc(size);
		fs.read(this.fd, buff, 0, size, null, (err, bytesRead) => {
			if (err) return this.destroy(err);
			// null 可读流读取完毕触发 先后end、close事件
			this.push(bytesRead > 0 ? buff.subarray(0, 12) : null);
		});
	}

	_destroy(error, callback) {
		if (this.fd) {
			fs.close(this.fd, (err) => callback(err || error));
		} else {
			callback(error);
		}
	}
}

const stream = new FileReadStream({ fileName: "read.txt" });

stream.on("data", (chunk) => {
	console.log(chunk.length);
	console.log(chunk.toString("utf-8"));
});

stream.on("end", () => {
	console.log("可读流读取完毕");
});

stream.on("close", () => {
	console.log("可读流关闭");
});
