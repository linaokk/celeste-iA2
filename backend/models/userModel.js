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
    agentId : { type: String }, 
   role : { type: String, default: 'user'  } 
}, { timestamps: true });
userSchema.statics.signup = async function (email, password, numberPhone, companyName) {
if(!email || !password || !numberPhone || !companyName) {
    { throw Error('All fields must be filled'); }}
if(!validator.isEmail(email)) {
    throw Error('Email is not valid'); }
    const exists = await this.findOne({ email });
if(exists)throw Error(CLIENT_ALREADY_EXISTS);
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
const user = await this.create({ email, password: hash, phoneNumber: numberPhone, companyName });
return user;
}
userSchema.statics.login = async function (email, password) {
if(!email || !password) {
    { throw Error(ALL_FIELDS_REQUIRED); }}
const user = await this.findOne({ email });
if(!user) {
    throw Error(INCORRECT_EMAIL); } 
const match = await bcrypt.compare(password, user.password);
if(!match) {
    throw Error(INCORRECT_PASSWORD); }
    return user;
 }
 
module.exports = mongoose.model('User', userSchema);