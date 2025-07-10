const _ = require('lodash')

const dummy = (blogs) => {
	return 1;
}

const totalLikes = (blogs) => {
	const likes = blogs.map(blog => blog.likes)
	const sum = likes.reduce((acc, item) => acc + item, 0)
	return sum
}

const favoriteBlog = (blogs) => {
	const likes = blogs.map(blog => blog.likes)
	const maxLike = likes.indexOf(Math.max(...likes))
	const favorite = {
    	title: blogs[maxLike].title,
        author: blogs[maxLike].author,
        likes: blogs[maxLike].likes
    }

	return favorite
}

const mostBlogs = (blogs) => {
	if(blogs.length === 0){
		return null
	}

	const grouped = _.groupBy(blogs, 'author')
	const count = _.map(grouped, (items, author) => ({
		author,
		blogs: items.length
	}));
	return _.maxBy(count, 'blogs')
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }