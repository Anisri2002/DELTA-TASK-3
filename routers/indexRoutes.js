const express = require("express");
const router = express.Router();
const Users = require("../models/users.js");
const Invites = require("../models/invites.js");

var nameArray = [];
Users.find({}," name ",function(err,result){
    result.forEach(function(x){
        nameArray.push(x.name);
        console.log(result);
    });
}).then(function(){console.log("finished",nameArray);});

router.get("/",function(req,res){                       //done         //loads the first page (login/signUp page) (renders the signup view) or redirects to dashboard if user is logged in .
    console.log(req.cookies);    
        Users.findOne({name: req.cookies.user},function(err,result){           //verify if the cookie reps a user , if not render the login page.
            if(result !== null){                
                res.redirect("http://localhost:4000/"+result.name+"/dashboard");
            }
            else{
                res.render("login.ejs",{"flg":1});
            }
        });       
});

router.get("/:user/profile",function(req,res){                  //done       //loads the profile view
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
    Users.findOne({name: req.cookies.user},function(err,result){
        console.log(result);
        res.render("profile",{name:req.cookies.user,result:result,flg:1});        
    });  
    } 
});

router.get("/:user/dashboard",function(req,res){           //done        //loads the dashboard view . 
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
        var query = Invites.find({ 
        $or:[{eventType : "public"},{to: req.params.user}],
         },'organiser eventType to title acceptedUserNames');
         query.where("organiser").ne(req.params.user).exec(function(err,result){
             var data = result;
             console.log(data);                    
             res.render("dashboard.ejs",{"name" : req.cookies.user, "result" : data});              //render the dashboard view with result sent as local var for displaying title and link. Also if the current user has accepted the invite just display an accepted sign also.
         }); 
    }              
});

router.get("/:user/dashboard/invites",function(req,res){                //done        //loads the invite view page(with accept/reject btn)
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
    Invites.findById(req.query._id,function(err,result){
        res.render("invites",{result: result});
    });
    }    
});

router.get("/:user/myInvites",function(req,res){        //done        //loads myInvites page
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
    Invites.find({organiser : req.cookies.user},function(err,result){
        res.render("myInvites",{result: result, name: req.cookies.user });              //render the my invite view with invite links
    });
    }         
});

router.get("/:user/myInvites/invites",function(req,res){           //done  //loads invite created by user.
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
    Invites.findById(req.query._id,function(err,result){
        res.render("myInviteView",{result:result,name:req.cookies.user});
    });
    }
});

router.get("/:user/create",function(req,res){          // done       //loads the create view . (A form to make invites)
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
    res.render("create",{name: req.cookies.user,flg:1})
    }
});

router.get("/:user/logout",function(req,res){        //done           //logs the user out. (deletes the cookie)
    if(!(req.cookies.user)|| req.cookies.user==""){             //check if cookie exists .
        res.redirect("http://localhost:4000/");
    }
    else
    {
    res.clearCookie("user");
    res.redirect("http://localhost:4000/",);                        // redirect to log in / sign up page.
    }
});

router.post("/login",function(req,res){               //done           //action for Log In button    
    Users.findOne( {name: req.body.name},function(err,result){
        
        if(result !== null){
            if(result.password == req.body.password){
                res.cookie("user",req.body.name);                     
                res.redirect("../"+req.body.name + "/dashboard");             //   redirect to dashboard
            }
            else{
                  res.render("login",{"flg":0});     //render the login/signup page with a password error msg.
            }
        }
        else{
            res.render("login.ejs",{"flg":-1});     //render the login/signup page with a username error msg. 
        }
    }); 
});

router.post("/signUp",function(req,res){              //done          //action of signUp button
    console.log("signing up");                         
    Users.findOne({name: req.body.name},function(err,result){       //checks fr same name
        if(result === null){
            Users.create(req.body).then(function(user){
                res.render("login",{flg:5});                      //success page is to be rendered here and redirect user to login
            });
        }
        else{
            res.render("login",{flg : -2});    //error page to be rendered here (same signup page with a error).
        }
    });
});

router.post("/:user/profile",function(req,res){                     //action for change password form's submit btn
    console.log("profile req",req.body); 
    Users.findOne({name: req.cookies.user , password: req.body.oldPassword},function(err,result){
         if(result === null){
             Users.findOne({name:req.cookies.user},function(err,result){
                
                 res.render("profile",{flg:-1,result:result,name:req.cookies.user});     //render the profile page with an error.
                });                  
         }
         else{
             result.password = req.body.newPassword ;
             result.save();
             res.render("profile",{flg:2,result:result,name:req.cookies.user});             //render the profile page with a success message.
         }
     });      
});

router.post("/:user/create",function(req,res){                      //done              //action for SubmitInvite     
    Users.find({},"name",function(err,result){
        var flg = -1;

        if(req.body.eventType == 'private'){
         var i = 0;    
         console.log(result[1].name,req.body.to);
         for(i=0;i<result.length;i++){
            if( req.body.to == result[i].name ){
                flg=1;
                console.log("correcct");
                break;
            }
         }
        }else{
            flg=1;
        }

        if(flg!=1){
            res.render("create",{name:req.cookies.user,flg:-1});
        }else{          
        Invites.create(req.body).then(function(inv){
            res.redirect("./myInvites");   //render invite done successfully page
        });
        } 
    });
});

router.post("/:user/dashboard/invites",function(req,res){         //done      //action for accept/reject forms's submit btn        
    console.log(req.body);
    var flg = 0 ; 
    if(req.body.inviteStats == "accept"){               
        Invites.findById(req.query._id,function(err,result){
            for(i=0;i<result.acceptedUserNames.length;i++){
                if(result.acceptedUserNames[i] === req.cookies.user){flg = 1;break;}
            }  
            if(flg==0){         
            result.acceptedUserNames.push(req.cookies.user);
            console.log(result);
            result.save();
            }
        });
        Users.findOne({name: req.cookies.user},function(err,result){
            if(flg == 0){
            result.acceptedInvitesId.push(req.query._id);
            console.log(result);          
            result.save();   
            }         
        });
        res.redirect("/");                         // shud actually redirect to dashboard 
    }
    else if(req.body.inviteStats == "reject"){
        var index ;
        Invites.findById(req.query._id,function(err,result){
            console.log(result);
            for(i=0;i<result.acceptedUserNames.length;i++){
                if(result.acceptedUserNames[i] === req.cookies.user){index = i;break;}
            }
            if(index>-1){
            result.acceptedUserNames.splice(index,1);
            result.save();
            }
            console.log(result);
        });
        Users.findOne({name: req.cookies.user},function(err,result){
            console.log(result);
            for(i=0;i<result.acceptedInvitesId.length;i++){
                if(result.acceptedInvitesId[i] === req.query._id){index = i;break;}
            }
            if(index>-1){
            result.acceptedInvitesId.splice(index,1);
            result.save();
            }  
            console.log(result);
        });
        res.redirect("/");    // shud redirect to dashboard.
    }
});





  

/*
 
things still to build : 


delete invite : delete method .

***** front end *****
partial reqd fr nav menu 
login page : 2 forms with both submit buttons as post requests . Both forms are to validated client side.
dashboard : a single get method to render the view and to display the links of various invites the user has created,and recieved.

*/     
   






module.exports = router ;