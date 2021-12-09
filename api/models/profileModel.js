const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const schema = mongoose.Schema({
    account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'Account id cannot be empty']
    },
    name: {
        type: String,
        required: [true, 'Name cannot be empty']
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: [true, 'Gender cannot be empty']
    },
    birth_date: {
        type: Date,
        required: [true, 'Birth date cannot be empty']
    },
    country: {
        type: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: [true, 'Country id cannot be empty']
            },
            title: {
                type: String,
                required: [true, 'Country title cannot be empty']
            }
        },
        required: [true, 'Country cannot be empty']
    },
    address: {
        type: String,
        required: [true, 'Address cannot be empty']
    },
    image: {
        type: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                required: [true, 'file id cannot be empty']
            },
            original: {
                type: {
                    filename: {
                        type: String,
                        required: [true, 'original file name cannot be empty']
                    },
                    size: {
                        type: Number,
                        required: [true, 'original file size cannot be empty']
                    },
                    url: {
                        type: String,
                        required: [true, 'original file path cannot be empty']
                    }
                }
            },
            small: {
                type: {
                    filename: {
                        type: String,
                        required: [true, 'small file name cannot be empty']
                    },
                    size: {
                        type: Number,
                        required: [true, 'small file size cannot be empty']
                    },
                    url: {
                        type: String,
                        required: [true, 'small file path cannot be empty']
                    }
                }
            }
        }
    }
},
{
    timestamps: true
})

schema.plugin(mongoosePaginate)

const modelSchema = mongoose.model('Profile', schema)
modelSchema.paginate().then({})
module.exports = modelSchema