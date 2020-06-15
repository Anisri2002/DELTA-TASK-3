const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var InvitesSchema = new Schema({
organiser : String,
eventType : String,
to : String,
title : String,
body : String,
acceptedUserNames : [String]
});

var InvitesModel = mongoose.model("Invites",InvitesSchema);
module.exports = InvitesModel; //allows to create a pvt invite obj outside this file.