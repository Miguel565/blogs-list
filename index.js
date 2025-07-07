const app = require('./app') // Real express
const { PORT } = require('./utils/config')
const { info } = require('./utils/logger')

app.listen(PORT, () => {
  info(`Server running on port ${PORT}`)
})