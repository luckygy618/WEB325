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

module.exports.addEmployee = function(employeeData){
    if(employeeData.isManager != true){
        employeeData.isManager = false;
    }else {
        employeeData.isManager = true;
    }

    employeeData.employeeNum = employees.length + 1;
    employees.push(employeeData);

    return new Promise((resolve,reject)=>{
        if (employeeData.length ==0 || employees.length ==0){
            reject("Error in addEmployee");
        }else {
            resolve(employees);
        }
    });
}



module.exports.getEmployeesByStatus = function(status){
  
    return new Promise((resolve, reject) => {
        var getdepartment;
       
        if( status.toString().substr(1,4)== "Full" || status.toString().substr(0,4) == "Full"){
           // console.log("66666666666666: " + status.toString().substr(1,4)  );
         //   console.log("7777777777777: " + status.toString().substr(0,4)  );
          getdepartment = employees.filter((employees) => { return employees.status == 'Full Time'});
         }
         
         if (status.toString().substr(1,4) == "Part" ||status.toString().substr(0,4) == "Part"){
            getdepartment = employees.filter((employees) => { return employees.status == 'Part Time'});
         }

        if(getdepartment.length == 0){
        reject("no results returned");
        }
        else{
            resolve(getdepartment);
        }
    });
}





module.exports.getEmployeesByDepartment = function(department){
    return new Promise((resolve, reject) => {
        var getdepartment = employees.filter((employees) => { return employees.department == department});
        if(getdepartment.length == 0){
        reject("no results returned");
        }
        else{
            resolve(getdepartment);
        }
    });
}

module.exports.getEmployeesByManager = function(manager){
    return new Promise((resolve, reject) => {
        var getmanager = employees.filter((employees) => {return employees.employeeManagerNum == manager});
        if(getmanager.length == 0){
            reject("no results returned");
            }
            else{
                resolve(getmanager);
            }
    });
}


module.exports.getEmployeeByNum = function(num){
    return new Promise((resolve, reject) => {
        var getempNum = employees.filter((employees) => {return employees.employeeNum == num});
      
        if(getempNum.length == 0){
        reject("no results returned");
        }else {
            resolve(getempNum);
        }
    });
}