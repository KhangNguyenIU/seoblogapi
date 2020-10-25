const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')


require('dotenv').config();
//routes
const blogRoutes = require('./routes/blog')
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category')
const tagRoutes = require('./routes/tag')
const formRoutes = require('./routes/form')

const user = require('./models/user');

const app = express()
//enviroment variable

//cors
if (process.env.NODE_ENV === 'development') {
    app.use(cors({ origin: `${process.env.CLIENT_URL}` }))
}
//connect mongo
mongoose
    .connect(process.env.DATABASE_LOCAL, {
        useCreateIndex: true,
        useFindAndModify: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connect to database successfully ");
    })
    .catch(err => {
        console.log(err);
    })


//morgan
app.use(morgan('dev'))
//body-parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

//routes
app.use('/api', blogRoutes)
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', tagRoutes)
app.use('/api', formRoutes)


const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})