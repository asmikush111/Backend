const express=require('express');
require('../db/conn');
const router=express.Router();
const multer=require('multer');
const cookieParser = require('cookie-parser');
const bcrypt=require('bcryptjs');
const User=require('../model/userSchema');
const Auth=require('../middleware/Auth');
const validator =  require('validator');
router.use(cookieParser());


router.get('/',(req,res)=>{
    res.send("Hello world");
 });

const mlt=require('multer')();

const Storage=multer.diskStorage({
  destination:"uploads",
  filename:(req,file,cb)=>{
    cb(null,file.originalname);
  }
})

const upload=multer({
  storage:Storage
}).single('img')

router.post('/register', (req,res)=>{

      upload(req,res,async ()=>{
        var {firstname,lastname,email,phone,password,cpassword}=req.body;
        firstname=firstname.toLowerCase().trim();
        lastname=lastname.toLowerCase().trim();
        email=email.toLowerCase().trim();
        password=password.trim();
        cpassword=cpassword.trim();
        if(!firstname || !lastname || !email || !phone || !password || !cpassword)return res.status(400).json({error:"Please enter all data"});
        if(!req.file)return res.status(400).json({error:"Please upload image file"});
        var image={data:req.file.filename,contentType:'image/png'};
        var re=/^[A-Za-z]+$/;
        if(!re.test(firstname))return res.status(400).json({error:"Firstname must contain only characters"});
        if(!re.test(lastname))return res.status(400).json({error:"Lastname must contain only characters"});
        if(!validator.isEmail(email))return res.status(400).json({error:"Please enter valid Email"});
        if(phone<1000000000)return res.status(400).json({error:"Phone Number must contain atleast 10 digit"});
        if(password.length<7)return res.status(400).json({error:"Password must contain atleast 7 character"});
        if(password!==cpassword)return res.status(400).json({error:"Confirm Password does not match"});

    try{
        const userExist=await User.findOne({email}); 
        if(userExist){return res.status(400).json({error:"Email already exits"});}
        else{
            const user=new User({firstname,lastname,email,phone,password,cpassword,image}); 
            const reg=await user.save(); 
            if(reg)res.json({message:"registeration succesful"}); }
    }
    catch(e){console.log(e);}
      })
});

router.post('/login',mlt.any(),async (req,res)=>{
  var {email,password}=req.body;
  email=email.toLowerCase().trim();
  password=password.trim();

  if(!email || !password)return res.status(400).json({error:"Please enter all field data"});
  if(!validator.isEmail(email))return res.status(400).json({error:"Please enter valid Email"});
  
    try{  
       const userExist=await User.findOne({email}); 
       if(!userExist)return res.status(400).json({error:"Email does not exist"});
       const ismatch=await bcrypt.compare(password,userExist.password);
       if(!ismatch)return res.status(400).json({error:"Wrong Password"});
       
        let token=await userExist.generateAuthToken();
        res.cookie('jwtoken',token);
        res.json({message:"login succesful"});   
    }
    catch(e){console.log(e);}
 });


router.get('/getdata',Auth,(req,res)=>{
  res.send(req.rootUser);
});


router.get('/logout',(req,res)=>{
  res.clearCookie('jwtoken',{path:'/'});
  res.status(200).send('Logout successful');
});


 module.exports=router;



