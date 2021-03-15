/*********************************************************************************
 * BTI325 – Assignment 6
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name: GuoYuCao Student ID: 061341145 Date: 2020-12-03
 *
 * Online (Heroku) Link:    https://guoyucao-a6.herokuapp.com/
 *
 ********************************************************************************/
//press F1 —> Beautify file —> choose beautify mode



var HTTP_PORT = process.env.PORT || 8080;
var express = require("express"); //npm init, npm install express ,git init,heroku login,heroku create,heroku apps:rename newname,git push heroku master
var app = express();
var path = require("path");
var multer = require("multer");
var bodyParser = require("body-parser"); //npm install body-parser 
var fs = require("fs");
const data_service = require('./data-service.js');
const dataServiceAuth = require('./data-service-auth');
const exphbs = require('express-handlebars'); //npm install express-handlebars then require ('express-handlebars') to include  the library
var clientSessions = require("client-sessions"); //npm install client-sessions

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

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

//- we will need this to conditionally hide/show elements to the user depending on whether they're currently logged in
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});


// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
//Define a helper middleware function (ie: ensureLogin from the Week 10 notes) that checks if a user is logged in 
var ensureLogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
};




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

app.get("/employees/add", ensureLogin, (req, res) => {
    console.log("TODO: return the addEmployee HTML file");
    data_service.getDepartments().
    then((data) => res.render("addEmployee", {
        departments: data
    })).
    catch(() => res.render("addEmployee", {
        departments: []
    }))
});

app.get("/images/add", ensureLogin, (req, res) => {
    console.log("add image files");
    res.render("addImage");
});



app.get("/employee/:empNum", ensureLogin, (req, res) => {
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
                res.render("employee", {
                    viewData: viewData
                }); // render the "employee" view
            }
        });
});


app.get("/employees", ensureLogin, (req, res) => {
    console.log("TODO: get all of the employees within the employees.json file");
    if (req.query.status) {
        data_service.getEmployeesByStatus(req.query.status)
            .then((data) => {
                if (data.length > 0) {
                    res.render("employees", {
                        employees: data
                    });
                } else {
                    res.render("employees", {
                        message: "no results"
                    })
                }
            })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    } else if (req.query.department) {
        data_service.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                if (data.length > 0) {
                    res.render("employees", {
                        employees: data
                    });
                } else {
                    res.render("employees", {
                        message: "no results"
                    })
                }
            })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    } else if (req.query.manager) {
        data_service.getEmployeesByManager(req.query.manager)
            .then((data) => {
                if (data.length > 0) {
                    res.render("employees", {
                        employees: data
                    });
                } else {
                    res.render("employees", {
                        message: "no results"
                    })
                }
            })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    } else {
        data_service.getAllEmployees()
            .then((data) => {
                if (data.length > 0) {
                    res.render("employees", {
                        employees: data
                    });
                } else {
                    res.render("employees", {
                        message: "no results"
                    })
                }
            })
            .catch(() => res.render("employees", {
                message: "no results"
            }))
    }
});


app.post("/employee/update", ensureLogin, (req, res) => {
    data_service.updateEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch(() => res.json({
            error: 'There is an error'
        }))
        .catch(() => {
            res.status(500).send("Unable to Update Employee");
        });
});


app.post('/employees/add', ensureLogin, function (req, res) {
    data_service.addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch((err) => res.json({
            "There is an error happening": err
        }))
});

app.get('/employees/delete/:empNum', ensureLogin, (req, res) => {
    data_service.deleteEmployeeByNum(req.params.empNum)
        .then(() => res.redirect("/employees"))
        .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"));
});


app.get("/managers", ensureLogin, (req, res) => {
    console.log("TODO: get all employees who have isManager==true");
    data_service.getManagers()
        .then((data) => {
            res.json(data)
        })
        .catch(() => res.json({
            error: 'There is an error'
        }))
});

app.get("/departments", ensureLogin, (req, res) => {
    console.log("TODO: get  all of the departments within the departments.json file");
    data_service.getDepartments()
        .then((data) => {
            if (data.length > 0) res.render("departments", {
                departments: data
            });
            else res.render("departments", {
                message: "no results"
            });
        })
        .catch(() => res.render("departments", {
            message: "no results"
        }))
});


app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
    console.log("return image files");
    res.redirect("/images");
});


app.get("/images", ensureLogin, (req, res) => {
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

app.get('/departments/add', ensureLogin, (req, res) => {
    res.render("addDepartment");
});

app.post('/departments/add', ensureLogin, function (req, res) {
    data_service.addDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({
            "There is an error happening": err
        }))
})


app.post('/departments/update', ensureLogin, (req, res) => {
    data_service.updateDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({
            "There is an error happening": err
        }))
});


app.get('/department/:departmentId', ensureLogin, (req, res) => {
    data_service.getDepartmentById(req.params.departmentId)
        .then((data) => {
            if (data.length > 0) res.render("department", {
                department: data
            });
            else res.status(404).send("Department Not Found");
        })
        .catch(() => {
            res.status(404).send("Department Not Found")
        })
});

//This "GET" route simply renders the "login" view without any data (
app.get('/login', (req, res) => {
    res.render('login');
});
//This "GET" route simply renders the "register" view without any data
app.get('/register', (req, res) => {
    res.render('register');
});


//The User-Agent request header contains a characteristic string that allows the network protocol peers to identify the application type, operating system, software vendor or software version of the requesting software user agent (MDN).
app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent'); //. Before we do anything, we must set the value of the client's "User-Agent" to the request body property, ie:
    dataServiceAuth.checkUser(req.body)
        .then((rtnuser) => {
            req.session.user = {
                userName: rtnuser.userName,
                email: rtnuser.email,
                loginHistory: rtnuser.loginHistory
            };

            res.redirect('/employees');
        }).catch((err) => {
            res.render('login', {
                errorMessage: err,
                userName: req.body.userName
            });
        });
});



//This "POST" route will invoke the dataServiceAuth.registerUser(userData) method with the POST data (ie:req.body)
app.post('/register', (req, res) => {
    dataServiceAuth.registerUser(req.body)
        .then(() => {
            res.render('register', {
                successMessage: "User created"
            });
        }).catch((err) => {
            res.render('register', {
                errorMessage: err,
                userName: req.body.userName
            });
        })
});

//This "GET" route will simply "reset" the session
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

//This "GET" route simply renders the "userHistory" view without any data 
app.get('/userHistory', ensureLogin, (req, res) => {
    // console.log(session.user.userName);
    res.render('userHistory');

});


// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


// setup http server to listen on HTTP_PORT

data_service.initialize()
    .then(dataServiceAuth.initialize)
    .then(() => {
        app.listen(HTTP_PORT, listenToTheStart);
    })
    .catch(() => {
        console.log("Initializing has error");
    })