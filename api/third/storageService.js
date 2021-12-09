const FormData = require('form-data')
const fs = require('fs')
const axios = require('axios')
const urlStorageService = process.env.URL_STORAGE_SERVICE
const apiKey = process.env.API_KEY

const image = async (imageFileRequest) => {
    try {
        const formData = new FormData()
        formData.append('image', fs.createReadStream(imageFileRequest.filepath), imageFileRequest.originalFilename)
        const config = {
            method: 'post',
            url: `${urlStorageService}/image`,
            headers: { 
                'Content-Type': 'application/json', 
                'x-api-key': apiKey, 
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            data : formData
        }
    
        const sendData = await axios(config)
        if(sendData) {
            if(sendData.data) {
                if(sendData.data.status) {
                    return {
                        responseCode: 200,
                        status: sendData.data.status,
                        message: sendData.data.message,
                        data: sendData.data.data
                    }
                }else {
                    return {
                        responseCode: 400,
                        status: sendData.data.status,
                        message: sendData.data.message
                    }
                }
            }else {
                return {
                    responseCode: 500,
                    status: false,
                    message: 'error undefined, maybe the service is dead.'
                }
            }
        }else {
            return {
                responseCode: 500,
                status: false,
                message: 'error undefined, maybe the service is dead.'
            }
        }
    }catch(error) {
        console.log('error', error.message)
        if(error.response) {
            if(error.response) {
                if(error.response.data) {
                    return {
                        responseCode: 500,
                        status: error.response.data.status,
                        message: error.response.data.message
                    }
                }else {
                    return {
                        responseCode: 500,
                        status: false,
                        message: 'error undefined, maybe the service is dead.'
                    }
                }
            }else {
                return {
                    responseCode: 500,
                    status: false,
                    message: error.message
                }
            }
        }else {
            return {
                responseCode: 500,
                status: false,
                message: 'error undefined, maybe the service is dead.'
            }
        }
    }
}

const imageDelete = async (imageId) => {
    try {
        const config = {
            method: 'delete',
            url: `${urlStorageService}/image?_id=${imageId}`,
            headers: { 
                'Content-Type': 'application/json', 
                'x-api-key': apiKey,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        }
    
        const sendData = await axios(config)
        if(sendData) {
            if(sendData.data) {
                if(sendData.data.status) {
                    return {
                        responseCode: 200,
                        status: sendData.data.status,
                        message: sendData.data.message,
                        data: sendData.data.data
                    }
                }else {
                    return {
                        responseCode: 400,
                        status: sendData.data.status,
                        message: sendData.data.message
                    }
                }
            }else {
                return {
                    responseCode: 500,
                    status: false,
                    message: 'error undefined, maybe the service is dead.'
                }
            }
        }else {
            return {
                responseCode: 500,
                status: false,
                message: 'error undefined, maybe the service is dead.'
            }
        }
    }catch(error) {
        console.log('error', error.message)
        if(error.response) {
            if(error.response) {
                if(error.response.data) {
                    return {
                        responseCode: 500,
                        status: error.response.data.status,
                        message: error.response.data.message
                    }
                }else {
                    return {
                        responseCode: 500,
                        status: false,
                        message: 'error undefined, maybe the service is dead.'
                    }
                }
            }else {
                return {
                    responseCode: 500,
                    status: false,
                    message: error.message
                }
            }
        }else {
            return {
                responseCode: 500,
                status: false,
                message: 'error undefined, maybe the service is dead.'
            }
        }
    }
}

module.exports = { image, imageDelete }