const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')

const api = supertest(app)

beforeEach(async () => {
	await Blog.deleteMany({})
	await Blog.insertMany(helper.initialBlogs)
})

test('Blogs are returned as json', async () => {
	await api.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
})

describe('Blogs length', () => {
	test('There are 3 blogs in the list', async () => {
		const response = await helper.blogInDb()
		assert.strictEqual(response.length, helper.initialBlogs.length, `Expected ${helper.initialBlogs.length} blogs, but got ${response.length}`)
	})
})

describe('Blog id', () => {
	test('Viewing a specific blog', async () => {
		const blogsAtStart = await helper.blogInDb()
		const blogToView = blogsAtStart[0]
		const response = await api.get(`/api/blogs/${blogToView.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		assert.strictEqual(response.body.title, blogToView.title, `Expected title to be ${blogToView.title}, but got ${response.body.title}`)
	})
})

describe('Add blog', () => {
	test('A valid blog can be added', async () => {
		const newBlog = {
			title: 'Test title',
			author: 'Test Author',
			url: 'http://www.testurl.com',
			likes: 1,
		}
		await api.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		const blogsAtEnd = await helper.blogInDb()
		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1, `Expected ${helper.initialBlogs.length + 1} blogs, but got ${blogsAtEnd.length}`)
		assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].title, newBlog.title, `Expected title ${newBlog.title}, but got ${blogsAtEnd[blogsAtEnd.length - 1].title}`)
	})
})

after(async () => {
	await mongoose.connection.close()
})