const Tag = require('../models/tag')
const slugify = require('slugify')
const { errorHandler} = require('../helpers/dbErrorHandler')
const Blog = require('../models/blog')
exports.create = async (req, res) => {
    
    const { name } = req.body
    let slug = slugify(name).toLowerCase()

    let tag = new Tag({ name, slug})
    await tag.save((err, data)=>{
        if(err){
            return res.status(422).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })
}

exports.list=async (req, res)=>{

    await Tag.find({}).exec((err, data)=>{
        if(err){
            return res.status(422).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })
}

exports.read =(req, res)=>{
    const slug = req.params.slug.toLowerCase()
    Tag.findOne({slug}).exec((err, tag)=>{
        if(err){
            return res.status(422).json({
                errror: errorHandler(err)
            })
        }
        //res.json(tag)
        Blog.find({tags: tag})
        .populate('tags', '_id name slug')
        .populate('categories', '_id name slug')
        .populate('postedBy', '_id name')
        .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
        .exec((err, data)=>{
            if(err){
                return res.status(422).json({
                    error: errorHandler(err)
                })
            }
            res.json({tag: tag, blogs: data})
        })
    })
}

exports.remove =(req, res)=>{
    const slug = req.params.slug.toLowerCase()
    Tag.findOneAndRemove({slug}).exec((err, data)=>{
        if(err){
            return res.status(422).json({
                errror: errorHandler(err)
            })
        }
        res.json({
            message: "Tag remove success"
        })
    })
}