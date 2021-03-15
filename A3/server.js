/*********************************************************************************
* BTI325 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: GuoYuo Cao Student ID: 061341145 Date: 2020-10-29
*
* Online (Heroku) Link:   https://guoyucao-bti-assignment3.herokuapp.com/
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
var multer=require("multer");
var bodyParser = require("body-parser");
var fs=require("fs");
const data_service = require('./data-service.js');
//const { get } = require("http");
//set up storage directory for the uploaded file
const storage= multer.diskStorage({destination:"./public/images/uploaded", filename:function(req,file,cb){
    cb(null,Date.now() + path.extname(file.originalname));//add time stamp to the filename to avoid depicated names
}});

const upload = multer({storage:storage});//use the storage directoru in middle ware multer

app.use(bodyParser.urlencoded({ extended: true }));//use the body-parser for non-file form

//for your server to correctly return the "css/site.css" file, the "static" middleware must be used:
app.use(express.static('public'));

//listen to the port
function listenToTheStart(){
console.log("Express http server listening on port " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    console.log("return home page");
    res.sendFile(path.join(__dirname,"/views/home.html"));
});


app.get("/about", (req, res) => {
    console.log("return /about page");
    res.sendFile(path.join(__dirname,"/views/about.html"));
});


app.get("/employees", (req, res) => {
    console.log("TODO: get all of the employees within the employees.json file");
    if(req.query.status){
        data_service.getEmployeesByStatus(req.query.status)
        .then((data)=>{res.json(data);})
        .catch((data)=>res.json({"statues": data}))
    }else if (req.query.department){
        data_service.getEmployeesByDepartment(req.query.department)
        .then((data)=>{res.json(data);})
        .catch(()=>res.json({error: 'There is an error'}))
    }else if (req.query.manager){
            data_service.getEmployeesByManager(req.query.manager)
            .then((data)=>{res.json(data);})
            .catch(()=>res.json({error: 'There is an error'}))
        }else {
            data_service.getAllEmployees().
            then((data)=>{res.json(data)})
            .catch(()=>res.json({error: 'There is an error'}))
        }});



app.get("/employees/add",(req,res)=>{
    console.log("TODO: return the addEmployee HTML file");
    res.sendFile(path.join(__dirname,"/views/addEmployee.html"));
});

app.get("/images/add",(req,res)=>{
    console.log("add image files");
    res.sendFile(path.join(__dirname,"/views/addImage.html"));
});


app.post('/employees/add', function(req, res) {
    data_service.addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch((err) => res.json({"There is an error happening": err}))   
}) 

app.get("/employees/:employeeNum",(req,res)=>{
    data_service.getEmployeeByNum(req.params.employeeNum)
    .then((data) => {res.json(data);})
    .catch((data)=>res.json({"/employees/:employeeNum": data}))
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


app.post("/images/add", upload.single("imageFile"), (req,res)=>{
    console.log("return image files");
    res.redirect( "/images");
} );


app.get("/images",(req,res)=>{
    fs.readdir("./public/images/uploaded", function(err, files){ 
        if (err) 
          console.log(err); 
        else { 
          console.log("return image files");          
            var jsonObj = {};
            jsonObj['images']=files;
            res.json(jsonObj);       
        } 
      }) 
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