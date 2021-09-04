//jshint esversion:6
require('dotenv').config();

const express=require("express");
const app= express();
const bodyParser= require('body-parser');
const https=require("https");
// const encrypt=require("mongoose-encryption");
// const md5=require("md5");
// const bcrypt=require("bcrypt");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.listen(3000,function(req,res){
  console.log("server up and running");
});
app.set('view engine', 'ejs');

const mongoose=require("mongoose");

app.use(session({
  secret:"Our Little Secret to put to Env",
  resave: false,
  saveUninitialized:false
}));
//starts a sesssion using express-session with the above params, the location of the start is crucial.
// 3rd param is set to flase usually so that we dont store uninitialized meaning new and unmodified pages as cookies to take up space.
app.use(passport.initialize());
app.use(passport.session());
//initialize passport and use passport for dealing with passport;

mongoose.connect("mongodb://localhost:27017/UserDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
//deprecataion fix
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});
// const secret= "youwillneverguessthepasswordboy"; this is put into .env
// seceret is our random string encryption key, we can also use generated key.
// loginSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ['password'] });
//mongoose plugin adds functionality to your shcema.
//encyrpted Fild specifies which field to encrypt, it takes an array.
// mongoose encrypt encrpts when the save is used or the insert, and when we use find(), it decrypts the field.
userSchema.plugin(passportLocalMongoose);
//this plugin adds passportlocal mongoose to the mongoose schema called loginSchema.similar to lv1 and 2 encryption.;
const User=mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// these 3 lines is from passport-local-mongoose, serialize is the genertion of the cookie;
app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
res.render("login");
});

app.get("/register",function(req,res){
res.render("register");
});

app.get("/secrets",function(req,res){
if (req.isAuthenticated()){
  res.render("secrets");
}else{
  res.redirect("/login");
}
// when get request to secrets route, if req is authenticated meaning login worked with passport and session with auth is created then wed have a cookie for it.

});

app.get("/submit",function(req,res){
res.render("submit");
});
app.get("/logout",function(req,res){
  req.logout();
  // logsout of session means cookie deleted.
  res.redirect("/");
})

app.post("/register",function(req,res){
  // bcrypt.hash(req.body.password,10,function(err,hash){
    // Login.findOne({email:{$in:[req.body.username]}},function(err,foundLogin){
    // if(err){console.log(err);}
    // else{
    //   if(foundLogin){
    //     res.send("sorry email taken");
    //   }else{
    //     const newUser= new Login({
    //       email:req.body.username,
    //       password:hash
    //     });
    //     newUser.save(function(err){
    //       if(!err){res.render("secrets");}
    //       else{
    //         console.log(err);
    //       }
    //     });
    //     console.log("saved login is "+newUser.email+" "+newUser.password);
    // }
    // }});});


// this is registering user using Passport, User is the model connecting to mongoose, this method relies on passport=local-mongoose
// this also doesnt allow duplicate registers.
    User.register({username:req.body.username},req.body.password,function(err,user){
      if (err){
        console.log(err);
        res.send(err);
      }else{
        passport.authenticate("local")(req,res,function(){
        // if no error, register the user with authentication and go to secrets page.
          res.redirect("/secrets");
        });
      }
  });
});
//findOne is for checking if in the database theres one which the email is the same as entered on register route.









app.post("/login", function(req,res){
  // create new user, then use req.login from passport to authenticate the new user object.
  //if no err, then passport authenticated and cookie is created and directed to secrets page.
  const user= new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user, function(err){
    if(err){console.log(err);}
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
// var typedEmail=req.body.username;

// Login.findOne({email:typedEmail},function(err,foundUser){
//   if(err){
//     console.log(err);
//   }else{
//     if (foundUser){
//     bcrypt.compare(req.body.password,foundUser.password,function(err,result){
//       if(result===true){
//         res.render("secrets");
//     }else{res.send("wrong password");}});
//   } else{
//     res.send("no account found");
//   }
// }
// });
});
