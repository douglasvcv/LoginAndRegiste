import mongoose, { mongo } from "mongoose";

export const User = mongoose.model('User', {
    name:String,
    email:String,
    password:String
})

