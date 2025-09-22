const http = require("http");
const fs = require('fs');
const url = require("url");

const myserver = http.createServer((req,res)=>{
    //console.log(req); info about user requests

    const log = `${Date.now()}:${req.url} New Req Received\n`;
    if(req.url === "/favicon.ico") return res.end();
    const myurl = url.parse(req.url,true);
    console.log(myurl);    
    fs.appendFile("log.txt",log, (err,data)=>{
        switch(req.url){
            case'/': res.end("Home Page");
            break;
            case'/about': res.end("i am piyush garg");
            break;
            default: 
            res.end("404 Not Founf");        
        }
        //res.end("Hello pajeet ur Bhraman master is here");
        });
    });

myserver.listen(8000,()=>{
    console.log("server started");    
})