const mongoose = require('mongoose');
const AppError = require('../AppError')
const mongoConnectionString = process.env.DB_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/fuelapp';
const Schema = mongoose.Schema;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoConnectionString);
    } catch (error) {
        throw new AppError(500, "Unable to connect to Database");
    }
}

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            match: /^[a-zA-Z][a-zA-Z0-9]{5,15}$/,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)
UserSchema.virtual('profile', {
    ref: 'Profile',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});
UserSchema.virtual('quotes', {
    ref: 'QuoteHistory',
    localField: '_id',
    foreignField: 'userId',
    justOne: false
})

const User = mongoose.model('User', UserSchema);


const ProfileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

    fullname: {
        type: String,
        required: true,
        match: /^[a-zA-Z\s]+$/
    },
    street1: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9\s.,-]+$/
    },
    street2: {
        type: String,
        required: false,
        match: /^[A-Za-z0-9#.\-\s/,]+$/
    },
    city: {
        type: String,
        required: true,
        match: /^[a-zA-Z\s]+$/,
    },
    state: {
        type: String,
        required: true,
        match: /^[A-Z]{2}$/
    },
    zip: {
        type: String,
        required: true,
        match: /^\d{5}(?:-\d{4})?$/
    }

})
const Profile = mongoose.model('Profile', ProfileSchema);

const QuoteHistorySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    gallonsRequested: {
        type: Number,
        min: 1,
        required: true
    },
    suggestedPricePerGallon: {
        type: Number,
        required: true
    },
    totalDue: {
        type: Number,
        require: true
    },
    deliveryDate: {
        type: String,
        require: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        }
    }
})
const QuoteHistory = mongoose.model('QuoteHistory', QuoteHistorySchema);

const InvalidTokenSchema = new Schema({
    jti: {
        type: String,
        required: true,
        unique: true
    },
    expTime: {
        type: Date,
        required: true
    },
});
InvalidTokenSchema.index({ expTime: 1 }, { expireAfterSeconds: 0 });
const InvalidToken = mongoose.model('InvalidToken', InvalidTokenSchema);


module.exports = { connectDB, User, Profile, QuoteHistory, InvalidToken };
