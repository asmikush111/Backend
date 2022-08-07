const express=require("express");
const cookieParser = require('cookie-parser');
const dotenv=require('dotenv');
const app=express();
app.use(cookieParser());
require('./db/conn');
app.use(express.json());
app.use(require('./router/rout'));

dotenv.config({path:'./config.env'});
const PORT=process.env.PORT;


app.listen(PORT);