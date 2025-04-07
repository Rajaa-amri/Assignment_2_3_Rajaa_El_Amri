import express from 'express'
import bodyParser from 'body-parser'
import connectDB from './config/db.js'
import movieRoutes from './routes/movieRoutes.js'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'  // Import für Mongoose

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

const uri = process.env.MONGODB_URI
mongoose.set('strictQuery', true) 
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Verbunden mit MongoDB!'))
  .catch((err) => console.error('Fehler bei der Verbindung mit MongoDB:', err))

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie API',
      version: '1.0.0',
      description: 'A simple Express Movie API',
    },
    // Sicherheitskonfiguration auskommentiert
    // components: {
    //   securitySchemes: {
    //     bearerAuth: {
    //       type: "http",
    //       scheme: "bearer",
    //       bearerFormat: "JWT",
    //     },
    //   },
    // },
    // security: [
    //   {
    //     bearerAuth: [],
    //   },
    // ],
  },
  apis: ['./routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(morgan('combined'))
app.use(bodyParser.json())

app.use(express.static('public'))

app.use(movieRoutes)

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    name: error.name,
    message: error.message,
  })
})

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`)
})
