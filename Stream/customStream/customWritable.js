const { Writable } = require("node:stream");
const fs = require("node:fs");

class FileWriteStream extends Writable {
	constructor({ highWaterMark, fileName }) {
		super({ highWaterMark });

		this.fileName = fileName;
		this.fd = null;
		this.chunks = [];
		this.chunksSize = 0;
		this.writesCount = 0;
	}

	// _construct将在构造函数之后执行，推迟调用自定义方法，直到调用callback
	_construct(callback) {
		fs.open(this.fileName, "w", (err, fd) => {
			if (err) {
				// 执行失败 err传递下去
				callback(err);
			} else {
				this.fd = fd;
				// 执行成功
				callback();
			}
		});
	}

	_write(chunk, encoding, callback) {
		this.chunks.push(chunk);
		this.chunksSize += chunk.length;

		if (this.chunksSize > this.writableHighWaterMark) {
			fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
				if (err) {
					return callback(err);
				}
				this.chunks = [];
				this.chunksSize = 0;
				++this.writesCount;
				callback();
			});
		} else {
			callback();
		}
	}

	_final(callback) {
		fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
			if (err) return callback(err);

			++this.writesCount;
			this.chunks = [];
			callback();
		});
	}

	_destroy(error, callback) {
		console.log("写入次数:", this.writesCount);
		if (this.fd) {
			fs.close(this.fd, (err) => {
				callback(err || error);
			});
		} else {
			callback(error);
		}
	}
}

(async () => {
	console.time("writeMany");

	const stream = new FileWriteStream({
		fileName: "write.txt",
	});

	let i = 0;

	const numberOfWrites = 1000000;

	const writeMany = () => {
		while (i < numberOfWrites) {
			const buff = Buffer.from(` ${i} `, "utf-8");

			// 最后一次写入
			if (i === numberOfWrites - 1) {
				return stream.end(buff);// 调用_final后触发finish事件
			}
			// write返回false标志写入数据达到highWaterMark
			if (!stream.write(buff)) {
				console.log('达到highWaterMark，i为：', i)
				break;
			}

			i++;
		}
	};

	writeMany();

	let d = 0;
	// 当缓存区的数据被清空后触发
	stream.on("drain", () => {
		++d;
		writeMany();
	});

	stream.on("finish", () => {
		console.log("缓存区清空次数:", d);
		console.timeEnd("writeMany");
	});
})();
