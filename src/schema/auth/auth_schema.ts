import mongoose, { Mongoose } from "mongoose"
import validator from "validator"
const AuthSchema = mongoose.Schema

const authSchema = new AuthSchema({

    email: {
        type: String,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email!'
        },
        unique: [true, "Email already exists in database!"],
        required: [true, 'Email is required'],
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
    },

    name: {
        type: String,
        required: [true, 'Name is required'],
    },

    country_code: {
        type: String,
        required: [true, 'Country Code is required'],
    },

    phone: {
        type: String,
        required: [true, 'Phone is required'],
    },

    complete_phone: String,

    verified: {
        type: Boolean, 
        default: false
    },


}, {timestamps: true})



export default mongoose.model('AuthSchema', authSchema)