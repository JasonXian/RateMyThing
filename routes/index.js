var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Thing = require("../models/thing");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

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
        email: req.body.email,
        isAdmin: 0
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

router.get("/forgot", function(req, res) {
   res.render("forgot"); 
});

router.post("/forgot", function(req, res) {
   async.waterfall([
        function(done){
           crypto.randomBytes(20, function(err, buf){
              var token = buf.toString("hex");
              done(err, token);
           });
        }
    , 
        function(token, done){
            User.findOne({email: req.body.email}, function(err, user){
                if(err || !user){
                    req.flash("error", "Email does not match any user.");
                    res.redirect("/forgot");
                }else{
                    user.passwordToken = token;
                    user.passwordExpiry = Date.now() + 1800000;
                    user.save(function(err){
                        done(err, token, user);
                    });
                }
            });
        }
    ,
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
               service: "gmail",
               auth:{
                   user: "ratemything@gmail.com",
                   pass: process.env.gmailPW
               }
            });
            var mailOptions = {
                to: user.email,
                from: "ratemything@gmail.com",
                subject: "Rate My Thing Password Reset",
                text: "Please click on the following link in order to reset your password: \n" + "http://" + req.headers.host + "/reset/" + token + "\n"
            }
            smtpTransport.sendMail(mailOptions, function(err){
               done(err, "done");
            });
        }
    ], function(err){
        if(err){
            req.flash("error", "Could not send a password reset email.");
        }else{
            req.flash("success", "Email sent, will expire in 30 minutes");
        }
        res.redirect("/forgot");
    });
});

router.get("/reset/:token", function(req, res) {
    User.findOne({passwordToken: req.params.token, passwordExpiry: {$gt: Date.now()}}, function(err, user){
        if(err){
            req.flash("Error, either token is invalid or has timed out");
            res.redirect("back");
        }else{
            res.render("reset", {token: req.params.token});
        }
    });
});

router.post("/reset/:token", function(req, res) {
    User.findOne({passwordToken: req.params.token, passwordExpiry: {$gt: Date.now()}}, function(err, user){
        if(err){
            req.flash("error", "Error, either token is invalid or has timed out.");
            return res.redirect("back");
        }else{
            if(req.body.password === req.body.confirmPassword){
                user.setPassword(req.body.password, function(err){
                    user.passwordToken = undefined;
                    user.passwordExpiry = undefined;
                    user.save(function(err){
                        if(err){
                            req.flash("Could not save new password.");
                            res.redirect("back");
                        }else{
                            res.redirect("/things");
                        }
                    });
                });
            }else{
                req.flash("error", "Error, passwords don't match!");
                res.redirect("back");
            }
        }
    });
});

module.exports = router;