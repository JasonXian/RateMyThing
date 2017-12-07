var mongoose = require("mongoose");

var thingSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    authour: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }    
    ]
});

module.exports = mongoose.model("Thing", thingSchema);