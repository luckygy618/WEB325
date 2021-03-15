const Sequelize = require('sequelize');

var sequelize = new Sequelize('dcgurr9jppnham', 'ykqlzutjmebnha', 'de8e05fe4f684b7ef05b0c40693905632deb8c1eadfda7df71a79bb69e16e2ab', {
    host: 'ec2-54-172-219-218.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        //ssl: true
        ssl: { rejectUnauthorized: false }
    }
});

sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));


// Define a "Employee" model
var Employee  = sequelize.define('Employee', {
    employeeNum:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    firstName: {type:Sequelize.STRING},
    lastName: Sequelize.STRING,
    email:Sequelize.STRING,
    SSN:Sequelize.STRING,
    addressStreet:Sequelize.STRING,
    addressCity:Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal:Sequelize.STRING,
    martialStatus:Sequelize.STRING,
    isManager:Sequelize.BOOLEAN,
    employeeManagerNum:Sequelize.INTEGER,
    status:Sequelize.STRING,
    department:Sequelize.INTEGER,
    hireDate:Sequelize.STRING
});

//define a "Department" Model
var Department = sequelize.define('Department', {
    departmentId: {
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },

    departmentName: Sequelize.STRING
});

module.exports.initialize = function () {
    return new Promise( (resolve, reject) => {
        sequelize.sync().then(() => {resolve()}).
        catch(()=>{ reject("unable to sync the database");});
       });
}



module.exports.getAllEmployees = function () {
    return new Promise(function (resolve, reject) {
        Employee.findAll(
            {order: sequelize.col('employeeNum')}

        )
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data);
        })
        .catch(()=>reject("no results returned"))
       });
}

module.exports.getEmployeesByStatus = function (status) {

    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{status: status}
           
        })
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data);
        })
        .catch(()=>reject("no results returned"))
       });
}

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{department: department}
        })
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data);
        })
        .catch(()=>reject("no results returned"))
       });
}

module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{employeeManagerNum: manager}
        })
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data);
        })
        .catch(()=>reject("no results returned"))
       });
}


module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{ employeeNum: num}
        })
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data[0]);
        })
        .catch(()=>reject("no results returned"))
       });
}

module.exports.getDepartments = function () {
    return new Promise(function (resolve, reject) {
        Department.findAll(
            {order: sequelize.col('departmentId')}
        )
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data);
        })
        .catch(()=>reject("no results returned"))
       });
}


//A for...in loop iterates over the properties of an object in an arbitrary order. for...in should not be used to iterate over an Array where the index order is important.
module.exports.addEmployee = function (employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (employee_properties in employeeData){
        if(employee_properties=="") {employee_properties=null;}
    }

    if(employeeData.employeeManagerNum==""){
        employeeData.employeeManagerNum=null;
    }

    return new Promise(function (resolve, reject) {
        Employee.create(employeeData)
        .then(()=>resolve())
        .catch(()=>reject("unable to create employee"))
       });
}

module.exports.updateEmployee = function (employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (employee_properties in employeeData){
        if(employee_properties=="") {employee_properties=null;}
    }
    if(employeeData.employeeManagerNum==""){
        employeeData.employeeManagerNum=null;
    }
    return new Promise(function (resolve, reject) {
        Employee.update (employeeData,{where: {employeeNum:employeeData.employeeNum}})
        .then(()=>resolve())
        .catch(()=>reject("unable to update employee"))

    });
};

module.exports.addDepartment = function(departmentData){
 
    for (departmentData_properties in departmentData){
        if(departmentData_properties=="") {departmentData_properties=null;}
    }

    return new Promise((resolve, reject) => {
        Department.create(departmentData)
        .then(()=>resolve())
        .catch(()=>reject("unable to create department"))
    });
};

module.exports.updateDepartment = function (departmentData) {

    for (departmentData_properties in departmentData){
        if(departmentData_properties=="") {departmentData_properties=null;}
    }

    return new Promise(function (resolve, reject) {
        Department.update ( departmentData, {where: {departmentId:departmentData.departmentId}})
        .then(()=>resolve())
        .catch(()=>reject("unable to update department"))

    });
};


module.exports.getDepartmentById = function(departmentId){
    return new Promise((resolve, reject) => {
       Department.findAll({
            where:{
                departmentId: departmentId
            }
        })
        .then((data)=>{
            data = data.map(value => value.dataValues);
            resolve(data);
        })
        .catch(()=>reject("no results returned")) 
    });
}


module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise((resolve, reject)=>{
        Employee.destroy({where: {employeeNum:empNum}})
    //    .then((data)=>{
     //       data = data.map(value => value.dataValues);
     //       resolve(data);

     .then(()=>resolve())
      //  }) 
      .catch(()=>reject("unable to delete employee"))
    }
    );}
