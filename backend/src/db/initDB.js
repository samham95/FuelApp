const { addUser } = require('../loginModule');
const { Profile, User } = require('./MongoDatabase')
const { AppError } = require('../AppError')

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

module.exports = initDB;