const { test, describe, afte, beforeEach } = require('node:test')
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

test.only('Blogs are returned as json', async () => {
		await api.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
})

describe('Blogs length', () => {
	test('There are 3 blogs in the list', async () => {
		const response = await api.get('/api/blogs')
		assert.estrictEquals(response.body.length, list_blogs.length)
	})
})

after(async () => {
	await mongoose.connection.close()
})