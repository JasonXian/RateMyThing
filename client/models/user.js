var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    isAdmin: Number,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required:true},
    avatar: String,
    bio: String,
    passwordToken: String,
    passwordExpiry: Date
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);