const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const { isEmail } = require('validator')

const schema = mongoose.Schema({
    phone_number: {
        type: String,
        unique: [true, 'Phone number already exist'],
        required: [true, 'Phone number cannot be empty']
    },
    email: {
        type: String,
        unique: [true, 'Email already exist'],
        required: [true, 'Email cannot be empty'],
        validate: [isEmail, 'Email not valid']
    },
    password: {
        type: String
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local'
    },
    status: {
        type: String,
        enum: ['verify', 'verified', 'rejected', 'suspend'],
        default: 'verify'
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'user'],
        default: 'user'
    },
    softDelete: {
        type: Date,
        default: null
    }
},
{
    timestamps: true
})

schema.plugin(mongoosePaginate)

const modelSchema = mongoose.model('Account', schema)
modelSchema.paginate().then({})
module.exports = modelSchema