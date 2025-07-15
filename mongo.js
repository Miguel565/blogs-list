require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)
mongoose.connect(process.env.TEST_MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB!')
    }).catch((error) => {
        console.error('Error connecting to MongoDB:', error.message)
        process.exit(1)
    })

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog(
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu',
        likes: 5,
        __v: 0
    },
    {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http:///www.cs.utexas.edu',
        likes: 12,
        __v: 0
    }
)

blog.save().then(() => {
    console.log('Blog saved!!')
    mongoose.connection.close()
})