/*********************************************************************************
* BTI325 – Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: GuoYu Cao Student ID: 061341145 Date: 2020-11-16
*
* Online (Heroku) Link:  https://guoyucao-a5.herokuapp.com
*
********************************************************************************/ 




var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
var path = require("path");
var multer = require("multer");
var bodyParser = require("body-parser");
var fs = require("fs");
const data_service = require('./data-service.js');
const exphbs = require('express-handlebars'); //npm install express-handlebars then require ('express-handlebars') to include  the library


//setup the engine 
app.engine('.hbs', exphbs({
    extname: '.hbs',

    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));


app.set('view engine', '.hbs'); //tell the eserver the hbs files are used by view engine


//set up storage directory for the uploaded file
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); //add time stamp to the filename to avoid depicated names
    }
});

const upload = multer({
    storage: storage
}); //use the storage directoru in middle ware multer

app.use(bodyParser.urlencoded({
    extended: true
})); //use the body-parser for non-file form

//for your server to correctly return the "css/site.css" file, the "static" middleware must be used:
app.use(express.static('public'));

//This will add the property "activeRoute" to "app.locals" whenever the route changes, ie: if our route is
//"/employees/add", the app.locals.activeRoute value will be "/employees/add".
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


//listen to the port
function listenToTheStart() {
    console.log("Express http server listening on port " + HTTP_PORT);
}


//  "render" the "home" view, instead of sending home.html
app.get("/", (req, res) => {
    console.log("return home page");
    res.render("home");
});


app.get("/about", (req, res) => {
    console.log("return /about page");
    res.render("about");
});

app.get("/employees/add", (req, res) => {
    console.log("TODO: return the addEmployee HTML file");
    data_service.getDepartments().
    then((data)=>res.render("addEmployee",{departments:data})).
    catch(()=>res.render("addEmployee",{departments:[]})) 
});

app.get("/images/add", (req, res) => {
    console.log("add image files");
    res.render("addImage");
});


/*
app.get("/employee/:employeeNum", (req, res) => {
    console.log("TODO: get  the employees names by employeeNum");
    data_service.getEmployeeByNum(req.params.employeeNum)
        .then((data) => {
            console.log("render employees names by employeeNum");
            res.render("employee", {
                employee: data
            })
        })
        .catch(() => res.render("employee", {
            message: "no results"
        }))
});
*/
app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
    viewData.employee = null; // set employee to null if none were returned
    }
    }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
    }).then(data_service.getDepartments)
    .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
    viewData.departments[i].selected = true;
    }
    }
    }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found");
    } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view
    }
    });
   });


app.get("/employees", (req, res) => {
    console.log("TODO: get all of the employees within the employees.json file");
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status)
        .then((data) => {
            if(data.length>0) {res.render("employees",{employees:data});}
            else {res.render("employees",{message: "no results"})}
        })
        .catch(() => res.render("employees",{message: "no results"}))
    }
     else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department)
        .then((data) => {
            if(data.length>0) {res.render("employees",{employees:data});}
            else {res.render("employees",{message: "no results"})}
        })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    } else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager)
        .then((data) => {
            if(data.length>0) {res.render("employees",{employees:data});}
            else {res.render("employees",{message: "no results"})}
        })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    } else {
        data_service.getAllEmployees()
        .then((data) => {
            if(data.length>0) {res.render("employees",{employees:data});}
            else {res.render("employees",{message: "no results"})}
        })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    }
});


app.post("/employee/update", (req, res) => {
    data_service.updateEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch(() => res.json({
            error: 'There is an error'
        }))
        .catch(()=>{
            res.status(500).send("Unable to Update Employee");
           });
});


app.post('/employees/add', function (req, res) {
    data_service.addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch((err) => res.json({
            "There is an error happening": err
        }))
});

app.get('/employees/delete/:empNum', (req,res)=>{
    data_service.deleteEmployeeByNum(req.params.empNum)
    .then(() => res.redirect("/employees"))
    .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"));
});


app.get("/managers", (req, res) => {
    console.log("TODO: get all employees who have isManager==true");
    data_service.getManagers()
        .then((data) => {
            res.json(data)
        })
        .catch(() => res.json({
            error: 'There is an error'
        }))
});

app.get("/departments", (req, res) => {
    console.log("TODO: get  all of the departments within the departments.json file");
    data_service.getDepartments()
    .then((data) => {
        if(data.length>0) res.render("departments",{departments:data});
        else res.render("departments",{message: "no results"});
    })
        .catch(() => res.render("departments", {
            message: "no results"
        }))
});


app.post("/images/add", upload.single("imageFile"), (req, res) => {
    console.log("return image files");
    res.redirect("/images");
});


app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        if (err)
            console.log(err);
        else {
            console.log("return image files");
            //  var jsonObj = {};
            // jsonObj['images']=files;
            res.render("images", {
                data: items
            });
        }
    })
});

app.get('/departments/add', (req, res) => {
    res.render("addDepartment");
});

app.post('/departments/add', function (req, res) {
    data_service.addDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({
            "There is an error happening": err
        }))
})


app.post('/departments/update', (req, res) => {
    data_service.updateDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({
            "There is an error happening": err
        }))
});


app.get('/department/:departmentId', (req, res) => {
    data_service.getDepartmentById(req.params.departmentId)
    .then((data) => {
        if(data.length>0) res.render("department",{department:data});
        else res.status(404).send("Department Not Found"); 
    })
    .catch(()=>{res.status(404).send("Department Not Found")})
});


// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


// setup http server to listen on HTTP_PORT

data_service.initialize()
    .then(() => {
        app.listen(HTTP_PORT, listenToTheStart);
    })
    .catch(() => {
        console.log("Initializing has error");
    })