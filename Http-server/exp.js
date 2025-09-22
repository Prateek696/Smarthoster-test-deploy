const express = require('express');
const http = require('http');
const app = express();

app.get('/',(req,res)=>{
    return res.send("hello from Home page");
});

app.get('/about',(req,res)=>{
    return res.send("I am Prateek");
});

const myServer = http.createServer(app);
myServer.listen(8000,() => console.log("server started!"));