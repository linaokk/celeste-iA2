const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { CLIENT_ALREADY_EXISTS, ALL_FIELDS_REQUIRED , INCORRECT_PASSWORD, INCORRECT_EMAIL} = require('../constants/errors');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {  type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber : { type: String, required: true  }, 
    companyName : { type: String, required: true  },
    agentId : { type: String , unique: true  }, 
   role : { type: String, default: 'user'  } 
}, { timestamps: true });
userSchema.statics.signup = async function (email, password, numberPhone, companyName) {
    const errors = {}; 
if(!email || !password || !numberPhone || !companyName) {
    errors.message = ALL_FIELDS_REQUIRED;
    throw { errors };
    }
if(!validator.isEmail(email)) {
    errors.message = INCORRECT_EMAIL;
    throw { errors }
};
    const exists = await this.findOne({ email });
if(exists){errors.message = CLIENT_ALREADY_EXISTS;
    throw { errors }; }
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
const user = await this.create({ email, password: hash, phoneNumber: numberPhone, companyName });
return user;
}
userSchema.statics.login = async function (email, password) {
    let errorMessages = {};
if(!email || !password) {
    errorMessages = ALL_FIELDS_REQUIRED;
    throw { errors: errorMessages };
    }
const user = await this.findOne({ email });
if(!user) {
    console.log("no user found");
    errorMessages.email = INCORRECT_EMAIL;
    throw {errors : errorMessages}; 
} 
const match = await bcrypt.compare(password, user.password);
if(!match) {
    errorMessages.password = INCORRECT_PASSWORD;
    throw { errors: errorMessages }; }
    return user;
 }
 
module.exports = mongoose.model('User', userSchema);