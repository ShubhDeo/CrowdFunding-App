const express = require('express');
const router = express.Router();
const ngoAdmin = require('../models/ngoAdmin');
const Program = require('../models/program');
const { imageUpload } = require('../config/db');

const mongoose = require('mongoose');
const { ensureGuest } = require('../middlewares/auth');

const upload = imageUpload();
const conn = mongoose.connection;
let gfs;
conn.on("open", () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' })
});


// GET /ngolist/medical
//@desc GET the list of medical-ngo's
router.get('/medical', ensureGuest, async (req, res) => {
    const ngo = await ngoAdmin.find({ type: 'medical' }).lean(); //This will give the ngo.
    res.render('ngoList', { type: 'MEDICAL NGO', ngo });
})


// GET /ngolist/education
//@desc GET the list of medical-ngo's
router.get('/education', ensureGuest, async (req, res) => {
    const ngo = await ngoAdmin.find({ type: 'education' }).lean(); //This will give the ngo.
    res.render('ngoList', { type: 'EDUCATIONAL NGO', ngo });
})

// GET /ngolist/environment
//@desc GET the list of medical-ngo's
router.get('/environment', ensureGuest, async (req, res) => {
    const ngo = await ngoAdmin.find({ type: 'environment' }).lean(); //This will give the ngo.
    res.render('ngoList', { type: 'ENVIRONMENTAL NGO', ngo });
})


//GET /ngo/:id
//@desc Gets the whole program details with ngo details.
router.get("/:id", ensureGuest, async (req, res) => {
    try {
        const ngo = await ngoAdmin.find({ _id: req.params.id }).lean();

        gfs.find().toArray((err, files) => {
            if (err) console.log(err);
            if (!files || files.length === 0) {
                res.render('error/404');
            }
            const f = files.filter(file => file.metadata.admin === req.params.id)
            res.render('ngo', { layout: 'ngo', ngo: ngo[0], files: f });
        })


    } catch (error) {
        console.log(error);
    }
})




module.exports = router;
