const Category = require('../models/categorry')
const Blog = require('../models/blog')
const slugify = require('slugify')
const { errorHandler} = require('../helpers/dbErrorHandler')
exports.create = async (req, res) => {
    
    const { name } = req.body
    let slug = slugify(name).toLowerCase()

    let category = new Category({ name, slug})
    await category.save((err, data)=>{
        if(err){
            return res.status(422).json({
                error: errorHandler(err)
            })
        }
        res.json(data)
    })
}

exports.list= async (req, res)=>{

    const data = await Category.find({}).exec((err, data)=>{
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
    Category.findOne({slug}).exec((err, category)=>{
        if(err){
            return res.status(422).json({
                error: errorHandler(err)
            })
        }
        //res.json(category)
        Blog.find( {categories: category})
        .populate('categories','_id name slug' )
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name')
        .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
        .exec((err, data)=>{
            if(err){
                return res.status(422).json({
                    error: errorHandler(err)
                })
            }
            res.json({category: category, blogs: data})
        })
    })
}

exports.remove =(req, res)=>{
    const slug = req.params.slug.toLowerCase()
    Category.findOneAndRemove({slug}).exec((err, data)=>{
        if(err){
            return res.status(422).json({
                errror: errorHandler(err)
            })
        }
        res.json({
            message: "Category remove success"
        })
    })
}