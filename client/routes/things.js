var express = require("express");
var router = express.Router();
var Thing = require("../models/thing");
var middleware = require("../middleware");
var geocoder = require("geocoder");

router.get("/", function(req, res){
    if(req.query.search){
        Thing.find({}, function(err, things){
            if(err){
                req.flash("Couldn't find a thing...");
                req.redirect("/things");
            }else{
                
            }
        });
    }
    var perPage = 16;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    Thing.find({}).skip(perPage * pageNumber - perPage).limit(perPage).exec(function(err, things){
        Thing.count().exec(function (err, count){
            if(err){
                req.flash("error", "Couldn't find a thing in the database of things...");
            }else{
                res.render("things/index", {things:things, pages: Math.ceil(count/perPage), currentPage: pageNumber});
            }
        });
    });
});

router.post("/", middleware.isLoggedIn, function(req,res){
    var authour = {id: req.user._id, username: req.user.username};
    geocoder.geocode(req.body.location, function (err, data) {
        if(err){
            req.flash("error", "Location is in the incorrect format!");
            res.redirect("/new");
        }else{
            var lat = data.results[0].geometry.location.lat;
            var long = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;
            var newThing = {name: req.body.name, image: req.body.image, description: req.body.description, authour: authour, location: location, lat: lat, long: long};
            Thing.create(newThing, function(err, things){
                if(err){
                    req.flash("error", "Couldn't create this thing!");
                    res.redirect("/things");
                }else{
                    res.redirect("/things");
                }
            });   
        }
    });
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
     geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var long = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var updatedThing = {name: req.body.name, image: req.body.image, description: req.body.description, location: location, lat: lat, long: long};
        Thing.findByIdAndUpdate(req.params.id, {$set: updatedThing}, function(err, thing){
            if(err){
                req.flash("error", "Couldn't find this thing!");
                res.redirect("/things");
            }else{
                req.flash("success", "Updated that thing!");
                res.redirect("/things/" + req.params.id);
            }
        });
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