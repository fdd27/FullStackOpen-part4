const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog => Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})


test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
}, 10000)

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blogs have id instead of _id', async () => {
    const res = await api.get('/api/blogs')
    expect(res.body[0].id).toBeDefined()
})

test('making post request successfully creates a new blog', async () => {
    const newBlog = {
        author: "Coding legend",
        title: "Never use console.log",
        url: "verygudcod.net",
        likes: "1337",
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const authors = blogsAtEnd.map(b => b.author)
    expect(authors).toContain('Coding legend')
})


afterAll(async () => {
    await mongoose.connection.close()
})