var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Thing = require("./models/thing");
var Comment = require("./models/comments");
var passport = require("passport");
var localStrat = require("passport-local");
var User = require("./models/user");
var commentRoute = require("./routes/comments");
var authRoute = require("./routes/index");
var thingRoute = require("./routes/things");
var methodOverride = require("method-override");
var app = express();

mongoose.connect("mongodb://localhost/rate_my_thing", {useMongoClient: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

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

app.use("/things", thingRoute);
app.use("/things/:id/comments", commentRoute);
app.use(authRoute);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started.");
});