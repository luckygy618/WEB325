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


var employees =[];
var departments =[];
var fs = require('fs');

//function initalize(){
 //   console.log('initialized in data services')
//}


module.exports.initialize = function (){
 
        var fsemp = (resolve,reject)=>  {
        fs.readFile("./data/employees.json",(err,empdata)=> {
            if (err) reject (err);
            employees = JSON.parse(empdata);
           resolve("Initialize Success");
          
        });
    }

        var fsdep =(resolve,reject)=>{ fs.readFile("./data/departments.json",(err,depdata)=> {
            if (err) reject (err);
            departments = JSON.parse(depdata);
           resolve("Initialize Success");
        
        });
    }
    var emp_promo = new Promise(fsemp);

  //  var dep_promo = new Promise(fsdep);
    return emp_promo.then(()=>{return new Promise(fsdep)})
    //.catch(()=>res.json({error: 'There is an error'}))
    
}



module.exports.getAllEmployees = function(){
    return new Promise((resolve, reject) => {
        if(employees.length == 0){
        reject("no results returned");
        }
        resolve(employees);
    });
}
           

module.exports.getManagers = function(){
    return new Promise((resolve, reject) => {
        if(employees.length == 0){
        reject("no results returned");
        }

        var is_manager = employees.filter((employees)=> {return employees.isManager == true});
        resolve(is_manager);
    });
}

module.exports.getDepartments = function(){
    return new Promise((resolve, reject) => {
        if (departments.length == 0){
        reject("no results returned");
        }
        resolve(departments);
    });
}