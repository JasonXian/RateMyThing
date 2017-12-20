var middleWareObject = {};
var Comment = require("../models/comments");
var Thing = require("../models/thing");
var User = require("../models/user");

middleWareObject.checkThingOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Thing.findById(req.params.id, function(err, thing){
            if(err || !thing){
                req.flash("error", "This thing has gone missing!");
                res.redirect("/things");
            }else{
                if((res.locals.currentUser.isAdmin === 1) || thing.authour.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");   
                }
            }
        });
    }else{
        req.flash("error", "Please login first!");
        res.redirect("back");
    }
}

middleWareObject.checkCommentOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err || !comment){
                req.flash("error", "Couldn't find that comment!");
                res.redirect("/things");
            }else{
                if((res.locals.currentUser.isAdmin === 1) || comment.authour.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");   
                }
            }
        });
    }else{
        req.flash("error", "Please login first!");
        res.redirect("back");
    }
}

middleWareObject.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first!");
    res.redirect("/login");
};

module.exports = middleWareObject;