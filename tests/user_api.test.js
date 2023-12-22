const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('bigsekret', 10)
    const user = new User({ username: 'root', name: 'mr admin', passwordHash })
    await user.save()
})

describe('when there is initially one user in db', () => {
    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = { username: 'fdd', name: 'fdd fdd', password: 'asdasd' }

        await api.post('/api/users').send(newUser).expect(201).expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = { username: 'root', name: 'Superuser', password: 'salainen' }

        const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })

    test('creation fails if missing username or password', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = { username: 'rando', password: '' }
    
        const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain('username or password missing')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
    
    test('creation fails when username or password is less than 3 characters', async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = { username: 'ra', name: 'The Sun God', password: 'ra' }
    
        const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)
        expect(result.body.error).toContain('username and password must be at least 3 characters long')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtStart).toEqual(usersAtEnd)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})