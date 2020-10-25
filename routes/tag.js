const express = require('express')
const router = express.Router()
const { create, list , read, remove } = require('../controllers/tag')
const { runValidation}= require('../validators/index')
const { createTagValidator} = require('../validators/tag')
const { requireSignin, audminMiddleware } = require('../controllers/auth')

router.post('/tag', createTagValidator,runValidation, requireSignin, audminMiddleware, create)
router.get('/tags', list)
router.get('/tag/:slug', read)
router.delete('/tag/:slug',requireSignin, audminMiddleware, remove)


module.exports = router