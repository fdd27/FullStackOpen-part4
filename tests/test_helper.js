const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title: 'The blog of coolness',
        author: 'The cool guy',
        url: 'coolblog.com',
        likes: 3,
    },
    {
        title: 'How to unlock giga-brain',
        author: 'Giga-brainiac',
        url: 'gigabrain.com',
        likes: 6,
    },
    {
        title: 'Cats are dumb',
        author: 'Ihatecats',
        url: 'stoopidcats.com',
        likes: 9,
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = { initialBlogs, blogsInDb, usersInDb }