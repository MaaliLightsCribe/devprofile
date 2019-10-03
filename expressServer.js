const express = require('express');
const connectDB = require('./config/db');
const router = express.Router();
const bodyParser = require('body-parser');


//Load Routes:
const userRoutes = require('./routes/api/user');
const authRoutes = require('./routes/api/auth');
const profileRoutes = require('./routes/api/profile');
const postRoutes = require('./routes/api/post');

const app = express();

//Connect Database:
connectDB();

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Define Routes:
app.get('/', (req, res) => res.send('API Running'))

router.use('/api/users', userRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/post', postRoutes);


app.use(router);



// Server Start Setting: 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));

