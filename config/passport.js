const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ngoAdmins = require('../models/ngoAdmin');



module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'tel' }, (tel, password, done) => {
            //Match User
            ngoAdmins.findOne({ tel: tel })
                .then(admin => {

                    if (!admin) {
                        return done(null, false, { message: 'That mobile number is not registered.' })
                    }
                    // Match password
                    bcrypt.compare(password, admin.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, admin)
                        } else {
                            return done(null, false, { message: 'Incorrect password' })
                        }
                    })
                })
                .catch(err => console.log(err))
        })
    );
    passport.serializeUser((admin, done) => {
        done(null, admin.id);
    });
    passport.deserializeUser((id, done) => {
        ngoAdmins.findById(id, (err, admin) => {
            done(err, admin);
        })
    })
}
