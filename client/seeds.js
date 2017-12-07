var mongoose = require("mongoose");
var Thing = require("./models/thing");
var Comment = require("./models/comments");

var data = [
    {
        name: "Bread",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Korb_mit_Br%C3%B6tchen.JPG/1200px-Korb_mit_Br%C3%B6tchen.JPG",
        description: "Made of flour."
    },
    {
        name: "Dog",
        image: "https://i.ytimg.com/vi/SfLV8hD7zX4/maxresdefault.jpg",
        description: "Likes to bark."
    },
    {
        name: "Cat",
        image: "http://www.petmd.com/sites/default/files/petmd-cat-happy-10.jpg",
        description: "Likes to meow."
    }
];

function seedDB(){
    Thing.remove({}, function(err, thing){
        if(err){
            console.log("error");
        }
        data.forEach(function(thing){
            Thing.create(thing, function(err, thing) {
                if(err){
                    console.log("Error!");
                }else{
                    Comment.create(
                       {
                           text: "Wow!",
                           authour: "John"
                       }, function(err, comment){
                           if(err){
                               console.log("Something went wrong!");
                           }else{
                                thing.comments.push(comment);
                                thing.save();
                           }
                        }
                    );
                }
            });
        });
    });
}

module.exports = seedDB;