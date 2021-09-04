//jshint esversion:6
require('dotenv').config();

const express=require("express");
const app= express();
const bodyParser= require('body-parser');
const https=require("https");
// const encrypt=require("mongoose-encryption");
const md5=require("md5");
const bcrypt=require("bcrypt");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.listen(3000,function(req,res){
  console.log("server up and running");
});
app.set('view engine', 'ejs');

const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/loginDB", {useNewUrlParser: true, useUnifiedTopology: true});
const loginSchema=new mongoose.Schema({
  email:String,
  password:String
});
// const secret= "youwillneverguessthepasswordboy"; this is put into .env
// seceret is our random string encryption key, we can also use generated key.



// loginSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ['password'] });
//mongoose plugin adds functionality to your shcema.

//encyrpted Fild specifies which field to encrypt, it takes an array.
// mongoose encrypt encrpts when the save is used or the insert, and when we use find(), it decrypts the field.
const Login=mongoose.model("Login",loginSchema);


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
res.render("secrets");
});

app.get("/submit",function(req,res){
res.render("submit");
});


app.post("/register",function(req,res){
  bcrypt.hash(req.body.password,10,function(err,hash){
    Login.findOne({email:{$in:[req.body.username]}},function(err,foundLogin){
    if(err){console.log(err);}
    else{
      if(foundLogin){
        res.send("sorry email taken");
      }else{
        const newUser= new Login({
          email:req.body.username,
          password:hash
        });
        newUser.save(function(err){
          if(!err){res.render("secrets");}
          else{
            console.log(err);
          }
        });
        console.log("saved login is "+newUser.email+" "+newUser.password);
    }
    }});});
  });
//findOne is for checking if in the database theres one which the email is the same as entered on register route.









app.post("/login", function(req,res){
var typedEmail=req.body.username;

Login.findOne({email:typedEmail},function(err,foundUser){
  if(err){
    console.log(err);
  }else{
    if (foundUser){
    bcrypt.compare(req.body.password,foundUser.password,function(err,result){
      if(result===true){
        res.render("secrets");
    }else{res.send("wrong password");}});
  } else{
    res.send("no account found");
  }
}
});
});
