const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../middlewares/auth');
const Program = require('../models/program');
const { imageUpload } = require('../config/db');
const ngoAdmin = require('../models/ngoAdmin');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const Payment = require('../models/Payment');


const upload = imageUpload();
const conn = mongoose.connection;
let gfs;
conn.on("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');

});


//GET /program/add
//@desc Program adding form
router.get('/add', ensureAuthenticated, async (req, res) => {
    const programs = await Program.find({ admin: req.user.id }).lean();
    if (programs.length === 5) {
        res.render('error/program')
    } else {
        res.render('program/add')
    }
})


//GET /program/:id
//@desc Specific program
router.get('/:id', ensureGuest, async (req, res) => {
    try {
        gfs.files.find().toArray(async (err, files) => {
            if (err) console.log(err);
            if (!files || files.length === 0) {
                res.render('error/404');
            }
            const f = files.filter(file => file._id.toString() === req.params.id);
            const payments = await Payment.find({ programId: req.params.id }).sort({ createdAt: "desc" }).lean();
            const admin = await ngoAdmin.find({ _id: f[0].metadata.admin })
            res.render('program/index', { layout: 'ngo', file: f[0], ngo: { name: admin[0].name, email: admin[0].email, tel: admin[0].tel, address: admin[0].address }, payments: payments.slice(0, 5) });
        })

    } catch (error) {
        console.log(error)
    }
})




//Uploads programs
router.post('/uploads', upload.single('image'), (req, res) => {
    try {
        const newProgram = {
            title: req.file.metadata.title,
            content: req.file.metadata.content,
            type: req.user.type,
            imageId: req.file.id,
            admin: req.user.id
        }
        Program.create(newProgram);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error);
        res.render('program/add', { problem: 'Try Again.' })
    }
})

router.get('/image/:imageName', (req, res) => {
    gfs.files.find().toArray((err, file) => {
        if (file.length === 0 || !file) {
            res.json('no image');
        } else {
            file.map(f => {
                if (f.filename === req.params.imageName) {
                    var readstream = gfs.createReadStream({ filename: req.params.imageName });
                    readstream.pipe(res);
                }
            })
        }
    })
})

//DELETE /program/:id
//@desc Deletes the program and payments related to it.
router.delete('/:id', (req, res) => {
    try {
        gfs.delete(new mongoose.Types.ObjectId(req.params.id), async (err, data) => {
            if (err) {
                console.log(err);
                res.render('error/404')
            }
            await Program.deleteOne({ imageId: req.params.id })
            await Payment.delete({ programId: req.params.id });
            res.redirect('/admin/dashboard');
        })
    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
})



module.exports = router;