const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
//const bcrypt = require('bcryptjs')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const app = require('../app')

const api = supertest(app)

describe('When there are blogs saved', () => {
	beforeEach(async () => {
		await Blog.deleteMany({})
		await Blog.insertMany(helper.initialBlogs)
	})
	test('Blogs are returned as json', async () => {
		await api.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})
	test('All blogs are returned', async () => {
		const response = await api.get('/api/blogs')
		assert.strictEqual(response.body.length, helper.initialBlogs.length, `Expected ${helper.initialBlogs.length} blogs, but got ${response.body.length}`)
	})
})

describe('Viewing a especific blog', () => {
	test('Succeeds with a valid id', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToView = blogsAtStart[0]
		const response = await api.get(`/api/blogs/${blogToView.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		assert.strictEqual(response.body.title, blogToView.title, `Expected title to be ${blogToView.title}, but got ${response.body.title}`)
	})
	test('Fails with statuscode 404, if blog does not exist', async () => {
		const invalidId = await helper.nonExistingId()

		await api.get(`/api/blogs/${invalidId}`).expect(404)
	})
	test('Fails with statuscode 400, if id is invalid', async () => {
		const fakeID = '34343f56d700458832a3a'

		await api.get(`/api/blogs/${fakeID}`).expect(400)
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
	test('Fails with statuscode 204 if blog does not exist', async () => {
		const invalidId = await helper.nonExistingId()
		await api.delete(`/api/blogs/${invalidId}`).expect(204)
	})
})

describe('Updating a blog', () => {
	test('Succeeds with status code 200 if id is valid', async () => {
		const blogsAtStart = await helper.blogsInDb()
		const blogToUpdate = blogsAtStart[0]
		const updatedBlog = {
			likes: blogToUpdate.likes + 1,
		}
		const response = await api.put(`/api/blogs/${blogToUpdate.id}`)
			.send(updatedBlog)
			.expect(200)
			.expect('Content-Type', /application\/json/)
		const blogsAtEnd = await helper.blogsInDb()
		const updatedBlogInDb = blogsAtEnd.find(b => b.id === blogToUpdate.id)
		assert.strictEqual(response.body.likes, blogToUpdate.likes + 1, `Expected likes to be ${blogToUpdate.likes + 1}, but got ${response.body.likes}`)
		assert(updatedBlogInDb, `Expected blog with id ${blogToUpdate.id} to be found in the database after update`)
	})
	test('Fails with statuscode 400, if id is invalid', async () => {
		const fakeID = '34343f56d700458832a3a'
		const updatedBlog = {
			likes: 2,
		}
		await api.put(`/api/blogs/${fakeID}`)
			.send(updatedBlog)
			.expect(400)
			.expect('Content-Type', /application\/json/)
	})
})

describe('When there is initially one user at db', () => {
	beforeEach(async () => {
		await User.deleteMany({})
		await User.insertMany(helper.initialUser)
	})
	test('Creation secceeds with a fresh username', async () => {
		const userAtStart = await helper.userInDb()
		const newUser = {
			username: 'mluukkai',
			name: 'Trafalgar Law',
			password: 'corazon'
		}
		await api.post('/pai/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/)
		const userAtEnd = await helper.userInDb()
		const usernames = userAtEnd.map(u => u.username)
		assert.strictEqual(userAtEnd.length, userAtStart.length + 1, `Expected ${userAtStart.length + 1} users, but got ${userAtEnd.length}`)
		assert(usernames.includes(newUser.username), `Expected username ${newUser.username} to be in the database, but it was not found`)
	})
	test('Creation fails with proper statuscode, if username already taken', async () => {
		const userAtStart = await helper.userInDb()
		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'passTest'
		}
		const result = await api.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)
		const userAtEnd = await helper.userInDb()
		assert(result.body.error.includes('expected `username` to be unique'), `Expected error message to include 'username' uniqueness constraint, but got ${result.body.error}`)
		assert.strictEqual(userAtEnd.length, userAtStart.length, `Expected ${userAtStart.length} users, but got ${userAtEnd.length}`)
	})
})

after(async () => {
	await mongoose.connection.close()
})