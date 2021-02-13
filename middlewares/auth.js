module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Please log in first to view.')
        res.redirect('/admin/login');
    },
    ensureGuest: (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/admin/dashboard');
        } else {
            return next();
        }
    }
}