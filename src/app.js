import express from "express"
import cookieParser from "cookie-parser"


const app=express();

app.use(express.Json({limit:"116kb"}));

app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));

app.use(cookieParser());

export {app}