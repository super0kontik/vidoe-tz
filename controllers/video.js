const fs = require('fs');
const ThumbnailGenerator = require('video-thumbnail-generator').default;
const { uploadPath, thumbnailPath, supportedTypes } = require('../config/config');

module.exports.getList = async (req, res) => {
    fs.readdir(uploadPath, (err, files) => {
        const data = files.map(item => {
            const name = item.substring(0, item.lastIndexOf('.'));
            const video = '/video/' + item;
            const thumb =
                '/thumbnail/' +
                    fs.readdirSync(thumbnailPath).find(thumb => thumb.indexOf(name) !== -1) || null;
            return { name, video, thumb };
        });
        res.json(data);
    });
};

module.exports.getVideo = async (req, res) => {
    const fileName = req.params.video;
    const path = uploadPath + fileName;
    fs.stat(path, (err, stat) => {
        if (err) {
            console.log(err);
            throw new Error(err);
        }
        const fileSize = stat.size;
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const file = fs.createReadStream(path, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/' + fileName.substring(fileName.lastIndexOf('.' + 1))
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/' + fileName.substring(fileName.lastIndexOf('.' + 1))
            };
            res.writeHead(200, head);
            fs.createReadStream(path).pipe(res);
        }
    });
};

module.exports.uploadVideo = async (stream, meta) => {
    if (supportedTypes.indexOf(meta.type) === -1) {
        stream.write({ err: 'Unsupported type: ' + meta.type });
        stream.end();
        return;
    }
    if (!meta.name || !meta.size) {
        stream.write({ err: 'Name or size are not provided' });
        stream.end();
        return;
    }

    const file = fs.createWriteStream(uploadPath + meta.name);
    stream.pipe(file);

    stream.on('data', data => {
        stream.write({ rx: data.length / meta.size });
    });

    stream.on('end', async () => {
        stream.write({ end: true });
        const tg = new ThumbnailGenerator({
            sourcePath: uploadPath + meta.name,
            thumbnailPath: thumbnailPath
        });
        await tg.generateOneByPercent(1);
    });
};
