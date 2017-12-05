var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Item = require("./models/item");
var Comment = require("./models/comments");
var seedDB = require("./seeds");
var passport = require("passport");
var localStrat = require("passport-local");
var User = require("./models/user");
var app = express();

mongoose.connect("mongodb://localhost/rate_my_thing", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

app.use(require("express-session")({
    secret: "Super secret thing",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/items", function(req, res){
    Item.find({}, function(err, items){
        if(err){
            console.log(err);
        }else{
            res.render("items/index", {items:items});
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
    res.render("items/new");
});

app.get("/items/:id", function(req, res) {
    Item.findById(req.params.id).populate("comments").exec(function(err, foundItem){
        if(err){
            console.log(err);
        }else{
            res.render("items/show", {item: foundItem});
        }
    });
});

app.get("/items/:id/comments/new", isLoggedIn, function(req, res) {
    Item.findById(req.params.id, function(err, item){
        if(err){
            console.log("Error");
        }else{
            res.render("comments/new", {item: item});
        }
    });
});

app.post("/items/:id/comments", isLoggedIn, function(req, res){
    Item.findById(req.params.id, function(err, item){
        if(err){
            console.log("Error made");
            res.redirect("/items");
        }else{
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log("err");
               }else{
                   item.comments.push(comment);
                   item.save();
                   res.redirect("/items/" + item._id);
               }
           });
        }
    });
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/items");
        });
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {   
        successRedirect: "/items",
        failureRedirect: "/login"
    }), function(req, res) {
        
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/items");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started.");
});