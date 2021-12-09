const mongoose = require('mongoose')
const env = require('dotenv')
env.config()

const mongodbUri = process.env.MONGODB_URL

function connect() {
    return new Promise((resolve, reject) => {
        mongoose.connect(`mongodb:${mongodbUri}`)
            .then((res, err) => {
                if (err) return reject(err)
                console.log('connected successfully to db.')
                resolve()
            })
    })
}

function close() {
    return mongoose.disconnect()
}

module.exports = { connect, close }