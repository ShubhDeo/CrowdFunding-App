const mongoose = require('mongoose');

const programSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'uploads.files'
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('Program', programSchema);