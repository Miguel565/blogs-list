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
        likes: req.body.likes || 0
    })

    const savedBlog = await blog.save()
    res.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (req, res) => {
    const blog = {
        title: req.body.title,
        author: req.body.author,
        url: req.body.url,
        likes: req.body.likes
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
    res.status(200).json(updatedBlog)
})

blogsRouter.delete('/:id', async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

module.exports = blogsRouter