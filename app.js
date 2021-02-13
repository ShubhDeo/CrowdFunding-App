const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const path = require('path');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoStore = require('connect-mongo')(session);
const passport = require('passport');
const Program = require('./models/program');
const methodOverride = require('method-override');
const axios = require('axios');


const app = express();

require(path.join(__dirname, 'config/passport.js'))(passport);

//Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//Method Override Middleware
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))



//LOad Config
dotenv.config({ path: './config/config.env' });



//Connect to databse
connectDB();




//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Handlebars helpers
const { formatDate, truncate } = require('./helpers/hbs');

//Express  handlebars middleware
app.engine('.hbs', exphbs({ helpers: { formatDate, truncate }, defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')



//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({ mongooseConnection: mongoose.connection })
}))

// Passport middleware (should be in the middle of session and flash)
app.use(passport.initialize());
app.use(passport.session());



//Connect flash (for flash messaging.)
app.use(flash());

//Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})




//Routes 
app.use('/', require('./routes/index'));
app.use('/ngo', require('./routes/ngo'));
app.use('/admin', require('./routes/admin'));
app.use('/program', require('./routes/program'))
app.use('/payment', require('./routes/payment'));




const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => { console.log(`Server started on port ${PORT}`) });

