var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Thing = require("../models/thing");

router.get("/", function(req, res){
    res.render("landing");
});

router.get("/register", function(req, res) {
    res.render("register", {page: "register"});
});

router.post("/register", function(req, res) {
    var newUser = new User({
        username: req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        email: req.body.email
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err || !user){
            req.flash("error", err.message);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Rate My Thing!, " + user.username);
            res.redirect("/things");
        });
    });
});

router.get("/login", function(req, res) {
    res.render("login", {page: "login"});
});

router.post("/login", passport.authenticate("local", 
    {   
        successRedirect: "/things",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res) {
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have logged out.");
    res.redirect("/things");
});

router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err){
            req.flash("error", "Could not find that user profile!");
            res.redirect("/things");
        }else{
            Thing.find().where("authour.id").equals(user._id).exec(function(err,things){
               if(err){
                   req.flash("error", "Could not find that user's personal things!");
            res.redirect("/things");
               }else{
                   res.render("user", {user: user, things: things}); 
               }
            });
        }
    });
});

router.put("/users/:id", function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, user){
        if(err){
            req.flash("error", "Could not update user!");
            res.redirect("/things");
        }else{
            res.redirect("/users/" + user._id);
        }
    });
});

module.exports = router;