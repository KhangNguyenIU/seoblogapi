const express = require('express')
const { signup, signin, signout, requireSignin,
     resetPassword, forgotPassword, preSignup,
    googleLogin } = require('../controllers/auth')
const router = express.Router()
const { runValidation} = require('../validators/index')
const  {userSignupValidator, userSigninValidator,resetPasswordValidator, forgotPasswordValidator} = require('../validators/auth')



router.post('/pre-signup', userSignupValidator,runValidation,preSignup)
router.post('/signup',signup)
router.post('/signin', userSigninValidator,runValidation,signin)
router.get('/signout', signout)
router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword)
router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword)

router.post('/google-login', googleLogin)
router.get('/secret', requireSignin, (req, res)=>{
    res.json({user: req.user})
})
module.exports = router