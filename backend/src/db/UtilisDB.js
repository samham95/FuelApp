const { addUser } = require('../loginModule');
const { Profile, User } = require('./MongoDatabase')
const { AppError } = require('../AppError')
const mongoConnectionString = process.env.DB_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/fuelapp';


const connectDB = async () => {
    try {
        await mongoose.connect(mongoConnectionString);
    } catch (error) {
        throw new AppError(500, "Unable to connect to Database");
    }
}

const closeDB = async () => {
    try {
        await mongoose.connection.close();
    } catch (error) {
        throw new AppError(500, "Unable to close database connection")
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

    try {
        const prevUser = await User.findOne({ username: 'samham' });
        if (!prevUser) {
            await addUser('samham', 'Abc12345!');
            const user = await User.findOne({ username: 'samham' });
            if (!user) throw new AppError(400, "User not found");
            const profile = new Profile({
                ...profileData,
                userId: user._id
            });
            await profile.save();
        }


    } catch (error) {
        console.log(error);
        return;
    }
};
const cleanDB = async () => {
    try {
        await mongoose.connection.dropDatabase();
    } catch (error) {
        throw error;
    }

}

module.exports = { initDB, connectDB, closeDB, cleanDB };