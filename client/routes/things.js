var express = require("express");
var router = express.Router();
var Thing = require("../models/thing");

router.get("/", function(req, res){
    Thing.find({}, function(err, things){
        if(err){
            console.log(err);
        }else{
            res.render("things/index", {things:things});
        }
    });
});

router.post("/", isLoggedIn, function(req,res){
    var authour = {id: req.user._id, username: req.user.username};
    var newThing = {name: req.body.name, image: req.body.image, description: req.body.description, authour: authour};
    Thing.create(newThing, function(err, things){
            if(err){
                console.log(err);
            }else{
                res.redirect("/things");
            }
        }
    );
});

router.get("/new", isLoggedIn, function(req, res){
    res.render("things/new");
});

router.get("/:id", function(req, res) {
    Thing.findById(req.params.id).populate("comments").exec(function(err, foundThing){
        if(err){
            console.log(err);
        }else{
            res.render("things/show", {thing: foundThing});
        }
    });
});

router.get("/:id/edit", checkThingOwner, function(req, res) {
    Thing.findById(req.params.id, function(err, thing){
        res.render("things/edit", {thing: thing});
    });
});

router.put("/:id", function(req, res) {
    Thing.findByIdAndUpdate(req.params.id, req.body.thing, function(err, thing){
        if(err){
            res.redirect("/things");
        }else{
            res.redirect("/things/" + req.params.id);
        }
    });
});

router.delete("/:id", checkThingOwner, function(req, res){
   Thing.findByIdAndRemove(req.params.id, function(err){
       res.redirect("/things");
   }); 
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

function checkThingOwner(req, res, next){
    if(req.isAuthenticated()){
        Thing.findById(req.params.id, function(err, thing){
            if(err){
                res.redirect("/things");
            }else{
                if(thing.authour.id.equals(req.user._id)){
                    next();
                }else{
                    res.redirect("back");   
                }
            }
        });
    }else{
        res.redirect("back");
    }
}

module.exports = router;