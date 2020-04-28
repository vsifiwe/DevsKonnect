const mongoose = require('mongoose');
const config = require('config');
const gravatar = require('gravatar');
const db = config.get('mongoURI');

const connectDb = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });

        console.log('MongoDB connected');
    } catch (error) {
        console.error(error.message);
    }
};

module.exports = connectDb;
