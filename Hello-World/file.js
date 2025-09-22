const fs = require('fs');
const os = require('os');

console.log(os.cpus().length);




//fs.writeFileSync('./test.txt', 'hey bitch '); //to write file

//async
//fs.writeFile("./text.txt",'hey bitch',(err)=> {}); // to write file

//const result =fs.readFileSync("./contracts.txt", "utf-8");
//console.log(result);

//Async* this do not return anything like sync to read file
// fs.readFile("./contracts.txt", "utf-8",(err,result)=>{
//     if(err){
//         console.log("Error",err);        
//     }
//     else{
//         console.log(result);
//     }
// });


//fs.appendFileSync("./text.txt",'\n Breaking Bad')

//fs.cpSync("./text.txt","./copy.txt"); //=> to make a copy
//fs.unlinkSync("./copy.txt"); => to delete a file


//console.log(fs.statSync("./text.txt")); //=> provide stats/info .isFile() to check if it exits


//Blocking vs non blocking in Node js architecture

//console.log("1");
//Blocking
const result1 = fs.readFileSync("./contracts.txt","utf-8");
//console.log(result1);

//console.log("2");

//non blocking give result async
fs.readFile("./contracts.txt","utf-8",(err,result)=>{
    if(err){
        console.log("error incoming");        
    }
    else{
        console.log(result);        
    }
})

console.log("1");
console.log("2");
console.log("3");
console.log("4");
console.log("5");


// Default Thread pool size = 4
//Max? -8core cpu -8













