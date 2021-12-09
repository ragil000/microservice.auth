const jwt = require('jsonwebtoken')

// check json web token exists
const requireAuth = (request, response, next) => {
    try {
        const getToken = request.headers.authorization ? request.headers.authorization.split(' ') : []
        let token = ''
        if(Array.isArray(getToken) && getToken.length == 2) {
            if(getToken[0] != 'Bearer') {
                return response.status(403).json({
                    status: false,
                    message: 'access denied, access token invalid.'
                })
            }else {
                token = getToken[1]
                try{
                    const decoded = jwt.verify(token, process.env.JWT_KEY)
                    request.accountData = decoded
                    next()
                }catch(error) {
                    return response.status(403).json({
                        status: false,
                        message: 'access denied, access token invalid.'
                    })
                }
            }
        }else {
            return response.status(403).json({
                status: false,
                message: 'access denied, Authorization header not found.'
            })
        }
    }catch(error) {
        return response.status(403).json({
            status: false,
            message: error.message
        })
    }
}

// check account role
const checkRoleAccount = (...role) => {
    return (request, response, next) => {
        if(!role.includes(request.accountData.role)) {
            return response.status(403).json({
                status: false,
                message: 'access denied, account role cannot access this request.'
            })
        }
        next()
    }
}

// check account role
const checkRoleToken = (...role) => {
    return (request, response, next) => {
        if(!role.includes(request.accountData.token_role)) {
            return response.status(403).json({
                status: false,
                message: 'access denied, token role cannot access this request.'
            })
        }
        next()
    }
}

module.exports = { requireAuth, checkRoleAccount, checkRoleToken }