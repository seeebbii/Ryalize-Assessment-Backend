import mongoose from "mongoose"

const TodoSchema = mongoose.Schema

const todoSchema = new TodoSchema({

    title: {
        type: String,
        required: [true, 'Title is required'],
    },

    completed: {
        type: Boolean,
        default: false,
    },
    

}, {timestamps: true})



export default mongoose.model('TodoSchema', todoSchema)