var express = require("express");
var router = express.Router({mergeParams: true});
var Thing = require("../models/thing");
var Comment = require("../models/comments");

router.get("/new", isLoggedIn, function(req, res) {
    Thing.findById(req.params.id, function(err, thing){
        if(err){
            console.log("Error");
        }else{
            res.render("comments/new", {thing: thing});
        }
    });
});

router.post("/", isLoggedIn, function(req, res){
    Thing.findById(req.params.id, function(err, thing){
        if(err){
            console.log("Error made");
            res.redirect("/things");
        }else{
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log("err");
               }else{
                   comment.authour.username = req.user.username;
                   comment.authour.id = req.user._id;
                   comment.save();
                   thing.comments.push(comment);
                   thing.save();
                   res.redirect("/things/" + thing._id);
               }
           });
        }
    });
});

router.get("/:comment_id/edit", checkCommentOwner, function(req, res){
    Comment.findById(req.params.comment_id, function(err, comment) {
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit", {thing_id: req.params.id, comment: comment});
        }
    })
});

router.put("/:comment_id", checkCommentOwner, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment) {
        if(err){
            res.redirect("back");
        }else{
            res.redirect("/things/" + req.params.id);
        }
    })
});

router.delete("/:comment_id", checkCommentOwner, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err, comment){
       if(err){
           res.redirect("back");
       }else{
           res.redirect("/things/" + req.params.id);
       }
   }); 
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

function checkCommentOwner(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err){
                res.redirect("/things");
            }else{
                if(comment.authour.id.equals(req.user._id)){
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