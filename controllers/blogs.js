const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
    const blogs = await Blog.find({})
    res.json(blogs)
})

blogsRouter.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    if (blog) {
        res.json(blog)
    } else {
        res.status(404).end()
    }
})

blogsRouter.post('/', async (req, res) => {
    if (!req.body.title || !req.body.url) {
        return res.status(400).json({ error: 'Title and URL are required' })
    }

    const blog = new Blog({
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        likes: req.body.likes
    })

    const savedBlog = await blog.save()
    res.status(201).json(savedBlog)
})

blogsRouter.put('/:id', (req, res, next) => {
    const body = req.body
    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }
    Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
        .then(updatedBlog => {
            res.json(updatedBlog)
        }).catch(error => next(error))
})

blogsRouter.delete('/:id', (req, res, next) => {
    Blog.findByIdAndDelete(req.params.id)
        .then(() => {
            res.status(204).end()
        }).catch(error => next(error))
})

module.exports = blogsRouter