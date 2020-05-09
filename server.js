const express = require('express');
const connectDb = require('./config/db');
const path = require('path');

const app = express();

connectDb();

//init bodyparser

app.use(express.json({ extended: false }));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));

//serve static assets

if (process.env.NODE_ENV === 'production') {
    // Set Static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Connected Successfully on port', PORT));
