const express = require('express')
const router = express.Router()
const { contactForm,contactBlogAuthorForm } = require('../controllers/form')
const { runValidation}= require('../validators/index')
const { contactFormValidators} = require('../validators/form')



router.post('/contact', contactFormValidators, runValidation, contactForm)
router.post('/contact-blog-author', contactFormValidators, runValidation, contactBlogAuthorForm);


module.exports = router