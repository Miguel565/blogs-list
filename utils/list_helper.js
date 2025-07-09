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

module.exports = { dummy, totalLikes, favoriteBlog }