const mongoose = require('mongoose');


const PaymentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    tel: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    programId: {
        type: String,
        required: true
    },
    ngoAdmin: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Payments', PaymentSchema);