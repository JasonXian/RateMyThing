var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res){
    res.render("landing");
});

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err || !user){
            req.flash("error", err.message);
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome " + user.username + " to Rate My Thing!");
            res.redirect("/things");
        });
    });
});

router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {   
        successRedirect: "/things",
        failureRedirect: "/login"
    }), function(req, res) {
        
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "You have logged out.");
    res.redirect("/things");
});

module.exports = router;