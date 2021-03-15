/*********************************************************************************
* BTI325 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: GuoYu Cao Student ID: 061341145 Date: 2020-10-07
*
* Online (Heroku) Link: https://guoyucao-assginment-2.herokuapp.com/ 
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
const data_service = require('./data-service.js');

//for your server to correctly return the "css/site.css" file, the "static" middleware must be used:
app.use(express.static('public'));

//listen to the port
function listenToTheStart(){
console.log("Express http server listening on port " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/home.html"));
});


app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname,"/views/about.html"));
});
app.get("/employees", (req, res) => {
    console.log("TODO: get all of the employees within the employees.json file");
    data_service.getAllEmployees()
    .then((data)=>{res.json(data)})
    .catch(()=>res.json({error: 'There is an error'}))

});



app.get("/managers", (req, res) => {
    console.log("TODO: get all employees who have isManager==true");
    data_service.getManagers()
    .then((data)=>{res.json(data)})
    .catch(()=>res.json({error: 'There is an error'}))
});

app.get("/departments", (req, res) => {
    console.log("TODO: get  all of the departments within the departments.json file");
    data_service.getDepartments()
    .then((data)=>{res.json(data)})
    .catch(()=>res.json({error: 'There is an error'}))
});


// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });



// setup http server to listen on HTTP_PORT

data_service.initialize()
.then(() => {
    app.listen(HTTP_PORT,listenToTheStart);
})
.catch(() => {
    console.log("Initializing has error");
})