const BinaryServer = require('binaryjs').BinaryServer;
const { uploadVideo } = require('./controllers/video');

module.exports = () => {
    const bs = new BinaryServer({ port: process.env.BSPORT || 5000 });
    bs.on('connection', async client => {
        client.on('stream', async (stream, meta) => {
            await uploadVideo(stream, meta);
        });
    });
};
