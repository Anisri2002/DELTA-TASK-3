const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
name: String,
password: String,
phoneNo: Number,
acceptedInvitesId: [String]
});

var userModel = mongoose.model("users",userSchema);
module.exports = userModel; //allows to create a user obj outside this file.