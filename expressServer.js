const express = require('express');
const connectDB = require('./config/db');
const router = express.Router();
const bodyParser = require('body-parser');
const path = require('path');


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
router.use('/api/users', userRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/profile', profileRoutes);
router.use('/api/posts', postRoutes);

app.use(router);

// Serve static assets in production
if(process.env.NODE_ENV === 'production') {
    //Set Static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}


// Server Start Setting: 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));

