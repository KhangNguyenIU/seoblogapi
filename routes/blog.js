const express = require('express')
const router = express.Router()
const { create, list, listAllBlogsCategoriesTags, read, remove,
    listSearch, update, photo, listRelated, listByUser } = require('../controllers/blog')
const { requireSignin, audminMiddleware, authMiddleware,canUpdateDeleteBlog } = require('../controllers/auth')

router.post('/blog', requireSignin, audminMiddleware, create);
router.get('/blogs', list);
router.post('/blogs-categories-tags', listAllBlogsCategoriesTags);
router.get('/blog/:slug', read);
router.delete('/blog/:slug', requireSignin, audminMiddleware, remove);
router.put('/blog/:slug', requireSignin, audminMiddleware, update);
router.get('/blog/photo/:slug', photo);
router.post('/blogs/related', listRelated);
router.get('/blogs/search', listSearch)


//auth user blog crud
router.post('/user/blog', requireSignin, authMiddleware, create);
router.delete('/user/blog/:slug', requireSignin, authMiddleware,canUpdateDeleteBlog, remove);
router.put('/user/blog/:slug', requireSignin, authMiddleware,canUpdateDeleteBlog, update);
router.get('/:username/blogs', listByUser);

module.exports = router;
