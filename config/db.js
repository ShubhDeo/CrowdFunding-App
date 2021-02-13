const mongoose = require('mongoose');
const multer = require('multer');
const Grid = require('gridfs-stream');
const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');

module.exports = {
    connectDB: async () => {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false
            })
            console.log(`Mongoose Connected at ${conn.connection.host}`);

        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    },
    imageUpload: () => {
        const storage = new GridFsStorage({
            url: process.env.MONGO_URI,
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                    req.body.admin = req.user.id; //Adds the admin id in req.body
                    crypto.randomBytes(16, (err, buf) => {
                        if (err) { return reject(err); }
                        const filename = buf.toString('hex') + path.extname(file.originalname);
                        const fileInfo = {
                            filename: filename,
                            bucketName: 'uploads',
                            metadata: req.body
                        }
                        resolve(fileInfo)
                    })
                })
            }
        })
        var upload = multer({ storage });
        return upload;
    }
}

