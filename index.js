const app = require('./app') // Real express
const { PORT } = require('./utils/config')
const { info } = require('./utils/logger')

server.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})