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

module.exports = { dummy, totalLikes, favoriteBlog }