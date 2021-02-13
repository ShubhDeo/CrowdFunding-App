const express = require('express');
const router = express.Router();
const ngoAdmins = require('../models/ngoAdmin');
const bcrypt = require('bcrypt');
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTHTOKEN)
const passport = require('passport');
const { ensureAuthenticated, ensureGuest } = require('../middlewares/auth');
const Program = require('../models/program');
const Payment = require('../models/Payment');

let clientInfo;
//GET /admin/register
//@desc admin register
router.get('/register', ensureGuest, (req, res) => {
    res.render('admin/admin-register')
})

//GET /admin/login
//@desc admin login
router.get('/login', ensureGuest, (req, res) => {
    res.render('admin/admin-login')
})

//GET /admin/dashboard
//@desc admin dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const programs = await Program.find({ admin: req.user.id }).lean()


        res.render('admin/admin-dashboard', {
            layout: 'dashboard',
            name: req.user.name,
            programs
        })
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
})

//GET /admin/verify/:tel/sms-otp
router.get('/verify/:tel/sms-otp', (req, res) => {
    const tel = req.params.tel;
    res.render('admin/admin-verify-otp', { tel })
})


router.get('/programDonation/:id', ensureAuthenticated, async (req, res) => {
    const payments = await Payment.find({ programId: req.params.id }).sort({ createdAt: 'desc' }).lean();
    const program = await Program.find({ imageId: req.params.id }).lean();
    let sum = 0;
    payments.forEach(payment => {
        sum += parseInt(payment.amount);
    })
    console.log(sum);
    res.render('program/donation', { layout: 'dashboard', payments, name: program[0].title, admin: program[0].admin.name, sum });
})


//POST /admin/register
router.post('/register', (req, res) => {
    const { name, email, tel, address, type, body, password, password2
    } = req.body;
    let errors = [];
    //Check all the fields.
    if (!name || !email || !tel || !type || !body || !password || !password2 || !address) {
        errors.push({ msg: 'Please fill all the fields' })
    }

    if (tel.slice(0, 3) !== '+91') {
        errors.push({ msg: 'Please add +91 before your mobile number.' })
    }

    let telLength = tel.slice(3, 13);

    if (telLength.length !== 10) {
        errors.push({ msg: 'Mobile number should be of 10 digits.' })
    }

    //Check password match
    if (password2 != password) {
        errors.push({ msg: 'Passwords do not match.' })
    }

    //About 
    if (body.length < 100) {
        errors.push({ msg: 'About description must be atleast 100 words.' })
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters.' });
    }

    if (errors.length > 0) {
        res.render('admin/admin-register', { errors })
    }

    ngoAdmins.findOne({ tel: tel })
        .then(user => {
            if (user) {
                //User already exists.
                res.render('admin/admin-error');
            }
            else {
                //SMS OTP SEND
                client
                    .verify
                    .services(process.env.SERVICE_ID)
                    .verifications
                    .create({
                        to: tel,
                        channel: 'sms'
                    })
                    .then(data => {
                        clientInfo = req.body;
                        res.redirect(`/admin/verify/${tel}/sms-otp`);
                    })
                    .catch(err => {
                        console.log(err);
                        res.render('error/500');
                    })
            }
        })


})



//POST /admin/verify/
//@desc Verify admin after entering otp
router.post('/verify', (req, res) => {
    const { tel, otp } = req.body;
    client
        .verify
        .services(process.env.SERVICE_ID)
        .verificationChecks
        .create({
            to: tel,
            code: otp
        })
        .then(data => {

            if (data.valid === true) {

                //Creating entry in the database.
                const newAdmin = new ngoAdmins({
                    name: clientInfo.name,
                    email: clientInfo.email,
                    tel: clientInfo.tel,
                    address: clientInfo.address,
                    type: clientInfo.type,
                    body: clientInfo.body,
                    password: clientInfo.password
                });


                //Hash Password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                        if (err) throw err;
                        //Set password to hash
                        newAdmin.password = hash;
                        //Save user
                        newAdmin
                            .save()
                            .then(admin => {
                                clientInfo = null;
                                //Flash msg to login
                                req.flash('success_msg', 'You are now registered and now can log in.')
                                res.redirect('/admin/login');
                            })
                            .catch(err => {
                                console.log(err);
                                res.render('error/500');
                            });
                    })
                })
            }

            else {
                res.render('admin/otp-error')
            }



        })
        .catch(err => {
            console.log(err);
        });
})

//POST /admin/login
//@desc Post req when a user log in
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next);
});


//GET /admin/logout
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/admin/login');
})


module.exports = router;