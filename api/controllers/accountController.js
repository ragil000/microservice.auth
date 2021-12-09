const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ModelAccount = require('../models/accountModel')
const ModelProfile = require('../models/profileModel')
const sanitize = require('mongo-sanitize')
const moment = require('moment')
const masterService = require('../third/masterService')
const storageService = require('../third/storageService')

// create json web token
const createToken = (data) => {
  return jwt.sign(data, process.env.JWT_KEY, {
    expiresIn: '365d'
  })
}

exports.gateaway_get = async (request, response, next) => {
    const accountData = request.accountData
    try{
        if(accountData) {
            const checkDataAccount = await ModelAccount.findOne({ _id: accountData._id })

            if(checkDataAccount) {
                const checkDataProfile = await ModelProfile.findOne({ account_id: accountData._id })
                if(checkDataProfile) {
                    return response.status(200).json({
                        status: true,
                        message: 'data has been displayed.',
                        data: {
                            _id: checkDataAccount._id,
                            photo: checkDataProfile.photo ? checkDataProfile.photo : '',
                            name: checkDataProfile.name ? checkDataProfile.name : '',
                            email: checkDataAccount.email ? checkDataAccount.email : '',
                            phone_number: checkDataAccount.phone_number ? checkDataAccount.phone_number : '',
                            gender: checkDataProfile.gender ? checkDataProfile.gender : '',
                            birth_date: checkDataProfile.birth_date ? moment(checkDataProfile.birth_date).format('DD/MM/YYYY') : '',
                            country: checkDataAccount.country ? checkDataAccount.country.title : '',
                            address: checkDataAccount.address ? checkDataAccount.address : '',
                            status: checkDataAccount.status ? checkDataAccount.status : '',
                            role: checkDataAccount.role ? checkDataAccount.role : '',
                            token_role: accountData.account_role || 'all'
                        }
                    })
                }else {
                    return response.status(400).json({
                        status: false,
                        message: 'profile not found.'
                    })
                }
            }
        }else {
            return response.status(400).json({
                status: false,
                message: 'token authorization not found.'
            })
        }
    }catch(error) {
        return response.status(500).json({
            status: false,
            message: error.message
        })
    }
}

exports.signup_post = async (request, response, next) => {
    let account_id = null
    try {
        const checkData = await ModelAccount.findOne({
            $or: [
                {
                    phone_number: sanitize(request.fields.phone_number)
                },
                {
                    email: sanitize(request.fields.email)
                }
            ]
        })

        if(checkData) {
            return response.status(400).json({
                status: false,
                message: 'phone number or email already exist.'
            })
        }else {
            let dataToSave = {}
            const salt = await bcrypt.genSalt()
            const passwordHash = await bcrypt.hash(request.fields.password, salt)

            dataToSave = {
                phone_number: sanitize(request.fields.phone_number),
                email: sanitize(request.fields.email),
                password: passwordHash,
                provider: 'local',
                role: 'super_admin',
                status: 'verified'
            }
            const saveDataAccount = await ModelAccount.create(dataToSave)

            if(saveDataAccount) account_id = saveDataAccount._id

            dataToSave = {}

            dataToSave['account_id'] = saveDataAccount._id

            dataToSave['name'] = sanitize(request.fields.name)
            dataToSave['gender'] = sanitize(request.fields.gender)
            dataToSave['birth_date'] = moment(sanitize(request.fields.birth_date), 'DD/MM/YYYY').toDate()

            if(sanitize(request.files.image)) {
                const getService = await storageService.image(sanitize(request.files.image))

                if(getService.status) {
                    const resultData = getService.data
                    dataToSave['image'] = {
                        _id: resultData._id,
                        original: {
                            filename: resultData.original.filename,
                            size: resultData.original.size,
                            url: resultData.original.url
                        },
                        small: {
                            filename: resultData.small.filename,
                            size: resultData.small.size,
                            url: resultData.small.url
                        }
                    }
                }else {
                    if(Object.keys(getService).length) {
                        return response.status(getService.responseCode || 500).json({
                            status: getService.status || false,
                            message: getService.message || 'data not found.'
                        })
                    }else {
                        return response.status(500).json({
                            status: false,
                            message: 'there was a problem uploading the file.'
                        })
                    }
                }
            }

            if(sanitize(request.fields.country_id)) {
                const getService = await masterService.country(sanitize(request.fields.country_id))
                if(getService.status) {
                    const resultService = getService.data
                    dataToSave['country'] = {
                        _id: resultService._id,
                        title: resultService.title
                    }
                }
            }

            dataToSave['address'] = sanitize(request.fields.address)

            const saveDataProfile = await ModelProfile.create(dataToSave)

            return response.status(201).json({
                status: true,
                message: 'data added successfully.'
            })
        }
    }catch(error) {
        if(account_id) {
            try {
                await ModelAccount.deleteOne({ _id: account_id })
            }catch(error) {
                return response.status(500).json({
                    status: false,
                    message: error.message
                })
            }
        }
        return response.status(500).json({
            status: false,
            message: error.message
        })
    }
}

exports.signup_put = async (request, response, next) => {
    const accountData = request.accountData
    try {
        const checkDataAccount = await ModelAccount.findOne({ _id: accountData._id })

        if(checkDataAccount) {    
            const checkData = await ModelAccount.findOne({
                $and: [
                    {
                        _id: accountData._id
                    },
                    {
                        $or: [
                            {
                                phone_number: sanitize(request.fields.phone_number)
                            },
                            {
                                email: sanitize(request.fields.email)
                            }
                        ]
                    }
                ]
            })
    
            if(checkData) {
                return response.status(400).json({
                    status: false,
                    message: 'phone number or email already exist.'
                })
            }else {
                let dataToUpdate = {}
                
                let passwordHash = null
                if(request.fields.password) {
                    const salt = await bcrypt.genSalt()
                    passwordHash = await bcrypt.hash(request.fields.password, salt)

                }
    
                dataToUpdate = {
                    phone_number: sanitize(request.fields.phone_number),
                    email: sanitize(request.fields.email),
                    password: passwordHash ? passwordHash : undefined
                }

                const updateDataAccount = await ModelAccount.updateOne({ _id: accountData._id }, { $set: dataToUpdate })
    
                dataToUpdate = {}
    
                dataToUpdate['name'] = sanitize(request.fields.name)
                dataToUpdate['gender'] = sanitize(request.fields.gender)
                dataToUpdate['birth_date'] = moment(sanitize(request.fields.birth_date), 'DD/MM/YYYY').toDate()

                if(sanitize(request.files.image)) {
                    const getService = await storageService.image(sanitizerequest.files.image)
    
                    if(getService.status) {
                        const resultData = getService.data
                        dataToUpdate['image'] = {
                            _id: resultData._id,
                            original: {
                                filename: resultData.original.filename,
                                size: resultData.original.size,
                                url: resultData.original.url
                            },
                            small: {
                                filename: resultData.small.filename,
                                size: resultData.small.size,
                                url: resultData.small.url
                            }
                        }
                    }else {
                        if(Object.keys(getService).length) {
                            return response.status(getService.responseCode || 500).json({
                                status: getService.status || false,
                                message: getService.message || 'data not found.'
                            })
                        }else {
                            return response.status(500).json({
                                status: false,
                                message: 'there was a problem uploading the file.'
                            })
                        }
                    }
                }

                const checkDataProfile = await ModelProfile.findOne({ account_id: accountData._id })
                if(sanitize(request.fields.old_image)) {
                    if(checkDataProfile) {
                        if(checkDataProfile.image._id == request.fields.old_file) {
                            dataToUpdate['file'] = {
                                _id: checkDataProfile.image._id,
                                original: {
                                    filename: checkDataProfile.image.original.filename,
                                    size: checkDataProfile.image.original.size,
                                    url: checkDataProfile.image.original.url
                                },
                                small: {
                                    filename: checkDataProfile.image.small.filename,
                                    size: checkDataProfile.image.small.size,
                                    url: checkDataProfile.image.small.url
                                }
                            }
                        }else {
                            const deleteFile = await storageService.imageDelete(sanitize(request.fields.old_file))
                        }
                    }
                }

                if('image' in dataToUpdate) {
                    if(!Object.keys(dataToUpdate['image']).length) {
                        return response.status(400).json({
                            status: false,
                            message: 'image is required.'
                        })
                    }
                }
    
                if(sanitize(request.fields.country_id)) {
                    const getService = await masterService.country(sanitize(request.fields.country_id))
                    if(getService.status) {
                        const resultService = getService.data
                        dataToUpdate['country'] = {
                            _id: resultService._id,
                            title: resultService.title
                        }
                    }
                }
    
                dataToUpdate['address'] = sanitize(request.fields.address)
    
                const saveDataProfile = await ModelProfile.updateOne({ account_id: accountData._id }, { $set: dataToUpdate })
    
                return response.status(200).json({
                    status: true,
                    message: 'data changed successfully.'
                })
            }
        }else {
            return response.status(400).json({
                status: true,
                message: 'account data not found.'
            })
        }
    }catch(error) {
        return response.status(500).json({
            status: false,
            message: error.message
        })
    }
}

exports.signin_post = async (request, response, next) => {
    try {
        const checkDataAccount = await ModelAccount.findOne({
            $or: [
                {
                    phone_number: sanitize(request.body.username)
                },
                {
                    email: sanitize(request.body.username)
                }
            ]
        })

        
        if(checkDataAccount) {
            const checkDataProfile = await ModelProfile.findOne({ account_id: checkDataAccount._id })
            const auth = await bcrypt.compare(request.body.password, checkDataAccount.password)
            if(auth) {
                const tokenData = {
                    _id: checkDataAccount._id,
                    status: checkDataAccount.status ? checkDataAccount.status : '',
                    role: checkDataAccount.role ? checkDataAccount.role : '',
                    token_role: 'all'
                }
    
                const token = createToken(tokenData)

                const data = {}
                if(checkDataProfile) {
                    data = {
                        token: token,
                        name: checkDataProfile.name ? checkDataProfile.name : '',
                        photo: checkDataProfile.photo ? checkDataProfile.photo : '',
                        status: checkDataAccount.status ? checkDataAccount.status : ''
                    }
                }else {
                    data = {
                        token: token,
                        username: sanitize(request.body.username)
                    }
                }

                return response.status(200).json({
                    status: true,
                    message: 'successfully authenticated.',
                    data: data
                })
            }else {
                return response.status(400).json({
                    status: false,
                    message: 'password invalid.'
                })
            }
        }else {
            return response.status(400).json({
                status: false,
                message: 'phone number or email not registered.'
            })
        }
    }catch(error) {
        response.status(500).json({
            status: false,
            message: error.message
        })
    }
}