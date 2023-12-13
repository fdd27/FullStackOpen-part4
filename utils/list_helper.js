const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = blogs => {
    const reducer = (sum, item) => {
        return sum + item
    }

    const likes = blogs.map(blog => blog.likes)

    return likes.reduce(reducer, 0)
}

const favoriteBlog = blogs => {
    const likes = blogs.map(blog => blog.likes)

    return blogs.find(blog => blog.likes === Math.max(...likes))
}

const mostBlogs = blogs => {
    const authors = blogs.map(blog => blog.author)
    const blogsPerAuthor = _.countBy(authors, (x) => x)
    const authorWithMostBlogs = _.maxBy(_.entries(blogsPerAuthor), ([k, v]) => v)
    const result = { author: authorWithMostBlogs[0], blogs: authorWithMostBlogs[1] }
    return result
}

const mostLikes = blogs => {
    const result = _(blogs).groupBy('author').map((objs, key) => ({
        'author': key,
        'likes': _.sumBy(objs, 'likes')
    })).maxBy('likes')
    return result
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }