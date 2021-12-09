const express = require('express')
const router = express.Router()
const controller = require('../controllers/accountController')
const checkAPIKEY = require('../middleware/checkAPIKEY')
const {requireAuth, checkRoleToken} = require('../middleware/checkAuth')
const formidableMiddleware = require('middleware-formidable')

router.get('/gateaway', checkAPIKEY, requireAuth, controller.gateaway_get)
router.post('/signup', checkAPIKEY, formidableMiddleware({multiples: true, allowEmptyFiles: true}), controller.signup_post)
router.post('/login', checkAPIKEY, controller.signin_post)
router.put('/signup', checkAPIKEY, requireAuth, checkRoleToken('all'), formidableMiddleware({multiples: true, allowEmptyFiles: true}), controller.signup_put)

module.exports = router