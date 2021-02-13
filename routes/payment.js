const express = require('express');
const router = express.Router();
const { ensureGuest } = require('../middlewares/auth')
const { imageUpload } = require('../config/db');
const ngoAdmin = require('../models/ngoAdmin');
const Program = require('../models/program');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

const upload = imageUpload();
const conn = mongoose.connection;
let gfs;
conn.on("open", () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' })
});



//GET /payment/:id
//@desc id of the program

router.get('/:id', ensureGuest, async (req, res) => {

    try {
        const program = await Program.find({ imageId: req.params.id }).lean().populate('admin');

        res.render('payment', { layout: 'payment', file: program[0] })
    } catch (error) {
        console.log(error);
    }
})


router.get('/contribution/:id', async (req, res) => {
    const program = await Program.find({ imageId: req.params.id }).populate('admin').lean();
    const payments = await Payment.find({ programId: req.params.id }).sort({ createdAt: 'desc' }).lean();
    res.render('contribution', { name: program[0].title, admin: program[0].admin.name, payments });
})



//POST /payment/charge
//@desc payment request stripe

router.post('/charge', async (req, res) => {
    const { programId, name, email, tel, amount, ngoadmin, stripeToken } = req.body;
    let errors = [];
    if (tel.length !== 10) {
        errors.push({ msg: 'Mobile number should be of 10 digits.' })
    }
    if (isNaN(amount)) {
        errors.push({ msg: 'Amount should be an integer.' })
    }
    if (!stripeToken) {
        errors.push({ msg: 'Please enter the card details.' })
    }
    if (errors.length > 0) {
        return res.json({ errors });
    }


    else {
        stripe.charges.create({
            amount: amount * 100,
            source: stripeToken,
            currency: 'inr',
            description: `Donation at ${ngoadmin} of programId ${programId} by ${name}`,
            receipt_email: email,
        }).then(charge => {
            const newPayment = new Payment({
                name,
                email,
                tel,
                amount,
                programId,
                ngoAdmin: ngoadmin
            })
            newPayment.save();

            return res.json({ message: 'Payment successful' })
        })
            .catch((err) => {
                console.log(err);
                return res.json({ paymentFail: false, id: programId })
            })
    }
})





module.exports = router;