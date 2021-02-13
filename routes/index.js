const express = require('express');
const router = express.Router();
const { ensureGuest } = require('../middlewares/auth');


//GET /
//@desc home page
router.get('/', ensureGuest, (req, res) => {
    res.render('index');
})


module.exports = router;