var express = require("express");
var router = express.Router();
var Thing = require("../models/thing");
var middleware = require("../middleware");

router.get("/", function(req, res){
    Thing.find({}, function(err, things){
        if(err){
            req.flash("error", "Couldn't find a thing in the database of things...");
        }else{
            res.render("things/index", {things:things});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req,res){
    var authour = {id: req.user._id, username: req.user.username};
    var newThing = {name: req.body.name, image: req.body.image, description: req.body.description, authour: authour};
    Thing.create(newThing, function(err, things){
            if(err){
                req.flash("error", "Couldn't create this thing!");
                res.redirect("/things");
            }else{
                res.redirect("/things");
            }
        }
    );
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("things/new");
});

router.get("/:id", function(req, res) {
    Thing.findById(req.params.id).populate("comments").exec(function(err, foundThing){
        if(err){
            req.flash("error", "Couldn't find this thing!");
        }else{
            res.render("things/show", {thing: foundThing});
        }
    });
});

router.get("/:id/edit", middleware.checkThingOwner, function(req, res) {
    Thing.findById(req.params.id, function(err, thing){
        if(err) req.flash("error", "Couldn't find this thing!");
        res.render("things/edit", {thing: thing});
    });
});

router.put("/:id", function(req, res) {
    Thing.findByIdAndUpdate(req.params.id, req.body.thing, function(err, thing){
        if(err){
            req.flash("error", "Couldn't find this thing!");
            res.redirect("/things");
        }else{
            req.flash("success", "Updated that thing!");
            res.redirect("/things/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkThingOwner, function(req, res){
   Thing.findByIdAndRemove(req.params.id, function(err){
       if(err){
           req.flash("error", "Couldn't find this thing!");
       }else{
           req.flash("success", "Deleted that thing!");
       } 
       res.redirect("/things");
   }); 
});

module.exports = router;