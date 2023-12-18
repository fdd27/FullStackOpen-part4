const Blog = require('../models/blog')

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
        likes: '6',
    },
    {
        title: 'Cats are dumb',
        author: 'Ihatecats',
        url: 'stoopidcats.com',
        likes: '9',
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, blogsInDb }