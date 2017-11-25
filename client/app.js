var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();

mongoose.connect("mongodb://localhost/rate_this_thing", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var itemSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Item = mongoose.model("Item", itemSchema);

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/items", function(req, res){
    Item.find({}, function(err, items){
        if(err){
            console.log(err);
        }else{
            res.render("index", {items:items});
        }
    });
});

app.post("/items", function(req,res){
    Item.create({
        name: req.body.name, image: req.body.image, description: req.body.description
        }, function(err, items){
            if(err){
                console.log(err);
            }else{
                console.log(items);
            }
        }
    );
    res.redirect("/items");
});

app.get("/items/new", function(req, res){
    res.render("new");
});

app.get("/items/:id", function(req, res) {
    Item.findById(req.params.id, function(err, foundItem){
        if(err){
            console.log(err);
        }else{
            res.render("show", {item: foundItem});
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started.");
});