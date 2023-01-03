const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: false
        },
        password: {
            type: String,
            required: false
        },
        fbId: {
            type: String,
            required: false,
            unique: true
        },
        fbToken: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: false
        },
        provider: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('User', userSchema);
