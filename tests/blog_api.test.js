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


describe('viewing blogs', () => {
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
})

describe('creating blogs', () => {
    test('making post request successfully creates a new blog', async () => {
        const loginInfo = {
            username: "root",
            password: "bigsekret"
        }

        const newBlog = {
            author: "Coding legend",
            title: "Never use console.log",
            url: "www.verigudcode.net",
            likes: "1337",
        }

        const user = await api
            .post('/api/login')
            .send(loginInfo)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${user.body.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const authors = blogsAtEnd.map(b => b.author)
        expect(authors).toContain('Coding legend')
    })

    test('if likes missing, defaults to 0', async () => {
        const loginInfo = {
            username: "root",
            password: "bigsekret"
        }

        const newBlog = {
            author: "Coding legend",
            title: "Never use console.log",
            url: "www.verigudcode.net",
        }

        const user = await api
            .post('/api/login')
            .send(loginInfo)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${user.body.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).toContain(newBlog.title)
    })

    test('does not accept missing title or url', async () => {
        const newBlog = {
            author: "Not gonna happen",
            likes: 5
        }
        const loginInfo = {
            username: "root",
            password: "bigsekret"
        }

        const user = await api
            .post('/api/login')
            .send(loginInfo)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${user.body.token}`)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    })

    test('fails with 401 if token not provided', async () => {
        const newBlog = {
            title: "You don't need authentication to post blogs",
            author: "Unauthenticated",
            url: "www.freeworld.org",
            likes: 69
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
})

describe('deleting blogs', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const loginInfo = {
            username: "root",
            password: "bigsekret"
        }

        const newBlog = {
            author: "Coding legend",
            title: "Never use console.log",
            url: "www.verigudcode.net",
            likes: "1337",
        }

        const user = await api
            .post('/api/login')
            .send(loginInfo)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', `Bearer ${user.body.token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtStart = await helper.blogsInDb()

        await api
            .delete(`/api/blogs/${blogsAtStart[blogsAtStart.length - 1].id}`)
            .set('Authorization', `Bearer ${user.body.token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).not.toContain(newBlog.title)
    })
})

describe('updating blogs', () => {
    test('valid update succeeds', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const updatedBlog = { ...blogsAtStart[0], likes: 69 }

        await api
            .put(`/api/blogs/${updatedBlog.id}`)
            .send(updatedBlog)
            .expect(200)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toContainEqual(updatedBlog)
    })
})


afterAll(async () => {
    await mongoose.connection.close()
})