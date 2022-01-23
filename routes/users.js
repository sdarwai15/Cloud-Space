const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/cloudspace");

const userSchema = mongoose.Schema({
	name: String,
	username: String,
	email: String,
	gender: String,
	password: String,
	data: Array,
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
