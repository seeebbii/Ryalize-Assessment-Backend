import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'

// ! Importing routes
import authRoutes from './routes/auth.routes'
import todoRoutes from './routes/todo.routes'
import path from 'path'

// ! Importing controllers

const app = express();
dotenv.config();


app.use(cors(), (req, res, next) => { next() })

// ! for parsing application/json
app.use(express.json())
// ! for parsing application/xwww-
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res, next) => {
    res.json({
        'message' : `Server is running at Port: ${process.env.PORT}`,
    })
})
mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true } as mongoose.ConnectOptions).then(() => console.log('MongoDb Connected')).catch((err) => console.log(err))
const httpServer = app.listen(process.env.PORT, () => console.log(`Server is running at Port: ${process.env.PORT}`))



// const io = new socketio.Server(httpServer, { allowEIO3: true } as socketio.ServerOptions);

app.use('/api/auth', authRoutes)
app.use('/api/todo', todoRoutes)