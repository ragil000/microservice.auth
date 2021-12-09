module.exports = (request, response, next) => {
    const apiKey = request.headers['X-API-KEY'] || request.headers['x-api-key']
    if(apiKey !== process.env.API_KEY) {
        return response.status(403).json({
            status: false,
            message: 'access denied, invalid API KEY.'
        })
    }
    next()
}