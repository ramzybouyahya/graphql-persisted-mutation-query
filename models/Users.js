const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { collaction: 'users' });

UserSchema.pre('save', function () {
    let HashedPassword = bcrypt.hashSync(this.password, 12);
    this.password = HashedPassword;
});

module.exports = mongoose.model('users', UserSchema);