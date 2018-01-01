var express = require("express");
var router = express.Router();
var Thing = require("../models/thing");
var middleware = require("../middleware");
var geocoder = require("geocoder");
var multer = require("multer");

var storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

var image = function(req, file, callback){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return callback(new Error("Only images allowed."), false);
    }
    callback(null, true);
};

var upload = multer({storage: storage, fileFilter: image});

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: "dwgehohp7",
    api_key: process.env.cloudinaryKey,
    api_secret: process.env.cloudinarySecret
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Thing.find({name: regex}, function(err, things){
            if(err){
                req.flash("Couldn't find the thing you searched for...");
                req.redirect("/things");
            }else{
                res.render("things/index", {things: things, pages: false});
            }
        });
    }else{
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
    }
});

router.post("/", middleware.isLoggedIn, upload.single("image"), function(req,res){
    cloudinary.uploader.upload(req.file.path, function(result){
        req.body.thing.image = result.secure_url;
        var authour = {id: req.user._id, username: req.user.username};
        req.body.thing.authour = authour;
        geocoder.geocode(req.body.thing.location, function (err, data) {
            if(err){
                req.flash("error", "Location is in the incorrect format!");
                res.redirect("/new");
            }else{
                var lat = data.results[0].geometry.location.lat;
                var long = data.results[0].geometry.location.lng;
                var location = data.results[0].formatted_address;
                req.body.thing.lat = lat;
                req.body.thing.long = long;
                Thing.create(req.body.thing, function(err, things){
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
        if(err){
            req.flash("Sorry, that's not a valid location!");
            req.redirect("things/news");
        }else{
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