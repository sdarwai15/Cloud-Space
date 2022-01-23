const express = require("express");
const router = express.Router();
const userModel = require("./users");
const localStrategy = require("passport-local");
const multer = require("multer");
const passport = require("passport");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/files");
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", checkLoggedIn, function (req, res) {
	res.render("index", { title: "Cloud Space - Home Page" });
});

router.post("/register", function (req, res) {
	var newUser = new userModel({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		gender: req.body.gender,
	});
	userModel
		.register(newUser, req.body.password)
		.then(function (createdUser) {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/profile");
			});
		})
		.catch(function (err) {
			res.send(err);
		});
});

router.get("/profile", isLoggedIn, function (req, res) {
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (foundUser) {
			res.render("profile", { foundUser, title: "Cloud Space - Profile Page" });
		});
});

router.get("/forNewFile", function (req, res) {
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (foundUser) {
			res.render("upload", { foundUser, title: "Cloud Space - Profile Page" });
		});
});

router.post("/upload", upload.single("file"), function (req, res) {
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (fU) {
			fU.data.push(req.file.filename);
			fU.save().then(function (dets) {
				res.redirect("/profile");
			});
		});
});

router.get("/download/:fileName", async (req, res) => {
	var clickedFile = req.params.fileName;
	userModel
		.findOne({ username: req.session.passport.user })
		.then(function (fUser) {
			// res.send(fUser);
			res.download(
				"C:/Users/HP/Desktop/cloudSpace/public/files/" + clickedFile,
				function (err) {
					if (err) console.log(err);
				}
			);
		});
});

router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/profile",
		failureRedirect: "/",
	}),
	function (req, res) {}
);

router.get("/logout", function (req, res) {
	req.logOut();
	res.redirect("/");
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/");
	}
}

function checkLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/profile");
	}
}

module.exports = router;
