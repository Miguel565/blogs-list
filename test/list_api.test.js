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

describe('When there are blogs saved', () => {
	test('Blogs are returned as json', async () => {
		await api.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})
	test('All blogs are returned', async () => {
		const response = await api.get('/api/blogs')
		assert.strictEqual(response.body.length, helper.initialBlogs.length, `Expected ${helper.initialBlogs.length} blogs, but got ${response.body.length}`)
	})
	test('Viewing a specific blog', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToView = blogsAtStart[0]
		const response = await api.get(`/api/blogs/${blogToView.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		assert.strictEqual(response.body.title, blogToView.title, `Expected title to be ${blogToView.title}, but got ${response.body.title}`)
	})
})

describe('Addition of a new blog', () => {
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
		const blogsAtEnd = await helper.blogsInDb()
		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1, `Expected ${helper.initialBlogs.length + 1} blogs, but got ${blogsAtEnd.length}`)
		assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].title, newBlog.title, `Expected title ${newBlog.title}, but got ${blogsAtEnd[blogsAtEnd.length - 1].title}`)
	})
	test('If likes is missing from the request, it will default to 0', async () => {
		const newBlog = {
			title: 'Blog sin likes',
			author: 'Autor test',
			url: 'http://www.testurl.com',
			// likes no está definido
		}
		const response = await api.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		assert.strictEqual(response.body.likes, 0, `Expected likes to be 0, but got ${response.body.likes}`)
	})
	test('Adding a blog without title or url returns 400', async () => {
		const newBlog = {
			author: 'Author test',
			likes: 0
		}
		await api.post('/api/blogs')
			.send(newBlog)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		const blogsAtEnd = await helper.blogsInDb()
		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length, `Expected ${helper.initialBlogs.length} blogs, but got ${blogsAtEnd.length}`)
	})
})

describe('Deletion of a blog', () => {
	test('Succeeds with status code 204 if id is valid', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToDelete = blogsAtStart[0]

		await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

		const blogsAtEnd = await helper.blogsInDb()
		const titles = blogsAtEnd.map((b) => b.title)
		assert(!titles.includes(blogToDelete.title), `Expected blog with title ${blogToDelete.title} to be deleted, but it was found in the database`)
		assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1, `Expected ${blogsAtStart.length - 1} blogs, but got ${blogsAtEnd.length}`)
	})
})

after(async () => {
	await mongoose.connection.close()
})