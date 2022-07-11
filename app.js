const express               =  require('express');
const app                   =  express();
const mongoose              =  require("mongoose");
const passport              =  require("passport");
const bodyParser            =  require("body-parser");
const LocalStrategy         =  require("passport-local");
const passportLocalMongoose =  require("passport-local-mongoose");
const path                  =  require('path');
const methodOverride        =  require("method-override");
const User                  =  require("./models/user.js");
const Note                  =  require("./models/note.js");

//Connection to database
mongoose.connect("mongodb://localhost:27017/GithubGistDB");

//Express-session to create and manage the sessions
app.use(require("express-session")({
    secret:"yuri secret word",
    resave: false,          
    saveUninitialized:false    
}));

//Setting view engine and public directory to place the css file
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));

//Adding authentication using passport library
passport.serializeUser(User.serializeUser());  
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));


app.use(bodyParser.urlencoded(
      { extended:true }
))
//used to rewrite the post request to put or delete
app.use(methodOverride("_method"));


app.get("/", (req,res) =>{
	res.render("home", {isAuthenticated: req.isAuthenticated()});
})

//Routes for register, login and logout
app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
}),function (req, res){

});

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,phone:req.body.phone}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})

//Middleware to check if the user is authenticated 
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//Routes for notes CRUD
app.get("/notes",(req,res)=>{
	Note.find({},(err,notes)=>{
        if (err) {console.log(err);
        }else{
            if(req.isAuthenticated())
	        res.render("showNotes",{notes: notes, isAuthenticated: req.isAuthenticated(), userAuthenticated: req.user.username});
            else
                res.render("showNotes",{notes: notes, isAuthenticated: false, userAuthenticated: undefined});
        }
       })
});

app.post("/notes",(req,res)=>{
	Note.find({"title" : {$regex : '(?i)' + req.body.query}},(err,notes)=>{
        if (err) {console.log(err);
        }else{
            if(req.isAuthenticated())
	        res.render("showNotes",{notes: notes, isAuthenticated: req.isAuthenticated(), userAuthenticated: req.user.username});
            else
                res.render("showNotes",{notes: notes, isAuthenticated: false, userAuthenticated: undefined});
        }
    })
});

app.get("/mynotes",(req,res)=>{
    Note.find({},(err,notes)=>{
            if (err) {console.log(err);
            }else{
                if(req.isAuthenticated())
                res.render("showmynotes",{notes: notes, isAuthenticated: req.isAuthenticated(), userAuthenticated: req.user.username});
                else
                    res.render("showmynotes",{notes: notes, isAuthenticated: false, userAuthenticated: undefined});
            }
        })
    });


app.post("/note/add",isLoggedIn,(req,res)=>{
    var title = req.body.title;
    var content = req.body.content;
    var status = req.body.status;
    var newNote = {title:title, content:content, owner:req.user.username, status:status};
    Note.create(newNote,(err,data)=>{
        if(err){
            console.log(err);
        }else {
            console.log(data);
            res.redirect("/");
        }
    })
})

app.get("/:id",(req,res)=>{

    Note.findById(req.params.id, (err , data)=>{
        if(err){
            console.log(err);
        }else {
            console.log(data);
            res.render("Note", {title: data.title, content:data.content, isAuthenticated: req.isAuthenticated()});
        }
    })
})

app.delete("/:id",(req,res)=>{
    Note.findByIdAndRemove(req.params.id,function (err){
        if(err){
            console.log(err);
            res.redirect("/");
        }else {
            res.redirect("/notes");
            }
    })
})

app.listen(3000, () => { console.log("Server has started!")});

module.exports = app
