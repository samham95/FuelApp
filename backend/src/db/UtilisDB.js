const { addUser } = require('../loginModule');
const { Profile, User, QuoteHistory } = require('./MongoDatabase')
const AppError = require('../AppError')
const mongoose = require('mongoose');
const mongoConnectionString = process.env.DB_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/fuelapp';


const connectDB = async () => {
    try {
        await mongoose.connect(mongoConnectionString);
    } catch (error) {
        throw new AppError("Unable to connect to Database", 500);
    }
}

const closeDB = async () => {
    try {
        await mongoose.connection.close();
    } catch (error) {
        throw new AppError("Unable to close database connection", 500)
    }
}

const initDB = async () => {
    const profileData = {
        fullname: 'Sammy Hamdi',
        street1: '9222 Memorial Dr.',
        street2: 'Apt. 212',
        city: 'Houston',
        state: 'TX',
        zip: '77379',
    };
    const validQuote = {
        address: {
            street: "9222 Memorial Dr. Apt. 212",
            city: "Houston",
            state: "TX",
            zip: "77379"
        },
        deliveryDate: "2024-04-04",
        gallonsRequested: 3,
        suggestedPricePerGallon: 2.5,
        totalDue: 7.5
    };

    try {
        const prevUser = await User.findOne({ username: 'samham' });
        if (!prevUser) {
            await addUser('samham', 'Abc12345!');
            const user = await User.findOne({ username: 'samham' });
            if (!user) throw new AppError("User not found", 400);
            const profile = new Profile({
                ...profileData,
                userId: user._id
            });
            await profile.save();
            await QuoteHistory.create({
                userId: user._id,
                ...validQuote
            })
        }


    } catch (error) {
        console.log(error);
        return;
    }
};

const cleanDB = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        try {
            await collection.deleteMany({});
        } catch (error) {
            throw new AppError(`Error clearing collection ${key}: ${error.message}`, 400);
        }
    }
};


module.exports = { initDB, connectDB, closeDB, cleanDB };