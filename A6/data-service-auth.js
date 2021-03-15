var mongoose = require('mongoose'); //npm install mongoose
const bcrypt = require('bcryptjs'); // npm install "bcryptjs" 
var Schema = mongoose.Schema;
var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User; // to be defined on new connection (see below)
//connecting string : mongodb+srv://luckyws618:gy20077032@senecaweb322.qeaph.mongodb.net/web322_week8?retryWrites=true&w=majority
module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb+srv://luckyws618:gy20077032@senecaweb322.qeaph.mongodb.net/web322_week8?retryWrites=true&w=majority");

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}



module.exports.registerUser = function (userData) {
    return new Promise((resolve, reject) => {
        if (userData.userName == "" || userData.password == "" || userData.password2 == "") {
            reject("Error: user name or password cannot be empty or only white spaces! ");

        } else if (userData.password != userData.password2) {

            reject("Error: Passwords do not match");
        } else {

            bcrypt.genSalt(10, function (err, salt) { // Generate a "salt" using 10 rounds
                bcrypt.hash(userData.password, salt, function (err, hashValue) { // encrypt the password: "myPassword123"
                    // TODO: Store the resulting "hashValue" value in the DB
                    if (err) {
                        reject('There was an error encrypting the password');
                    } else {
                        userData.password = hashValue;

                        let newUser = new User(userData);

                        newUser.save((err) => {

                            if (err) {
                                if (err.code == 11000) {
                                    reject("User Name already taken");
                                }
                                reject("There was an error creating the user: " + err);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }
    });
}


module.exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
        User.findOne({
                userName: userData.userName
            })
            .exec().then((foundUser) => {
                if (!foundUser) {
                    reject('No user found: ' + userData.userName);
                } else {
                    console.log("foundUser:    " + foundUser.password);
                    console.log("userData:    " + userData.password);
                    //Recall from the Week 12 notes - to compare an encrypted (hashed) value (ie: hashValue) with a plain text value (ie: "myPassword123", we can use the following code:
                    bcrypt.compare(userData.password, foundUser.password).then((res) => { //the order matters, the "myPassword123" ,ust be the first parameter and the hashed value must be the second parameter
                        // res === true if it matches and res === false if it does not match
                        if (res == true) {

                            if (foundUser.loginHistory == null) { //if null just set the value to this, sometime it cannot use "push" to a null string, it says no push property of null
                                foundUser.loginHistory = {
                                    dateTime: (new Date()).toString(),
                                    userAgent: userData.userAgent
                                };

                            } else {
                                foundUser.loginHistory.push({
                                    dateTime: (new Date()).toString(),
                                    userAgent: userData.userAgent
                                });

                            }

                            User.updateOne({
                                userName: foundUser.userName
                            }, {
                                $set: {
                                    loginHistory: foundUser.loginHistory
                                }
                            }).exec().
                            then(() => { //the updateOne returns nothing, cannot use then(user) to get the data, just use blank parameter
                                resolve(foundUser); //resolve the foundUser directely to set the value of session.user
                            }).catch((err) => {
                                reject("There was an error verifying the user: " + err);
                            });
                        } else {
                            reject("Incorrect Password for user: " + userData.userName);
                        }
                    });
                }
            })
            .catch((err) => {
                reject(err);
            });

    });
}