const express = require("express");
const bodyParser = require("body-parser");
const indexRoutes = require("./routers/indexRoutes.js");
const cookieParser = require("cookie-parser");
const mongoose  = require("mongoose");

const app = express();  //create an express app

app.set("views","./views");     // set view and view engine
app.set("view engine","ejs");

mongoose.connect('mongodb://localhost/invite',{useNewUrlParser:true , useUnifiedTopology:true });    // connect to MongoDB (make sure mongo runs in background)
mongoose.Promise = global.Promise;

app.use(cookieParser());
app.use(bodyParser.json());     //the middleware stack
app.use(bodyParser.urlencoded({extended:false}));
app.use(indexRoutes);


app.listen(4000,function(){console.log("Listening");});
