var express = require('express');
var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt')

var router = express.Router();


mongoose.connect('mongodb://107.170.99.156:27017/Torque-Data');//
var db = mongoose.connection;

var userSchema = new mongoose.Schema({
  username : String,
  password: String
});

// Compile a 'User' model using the userSchema as the structure.
// Mongoose also creates a MongoDB collection called 'User' for these documents.
var user = mongoose.model('user', userSchema);

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'The FourMonkeys Project' });
});

/*
	Login to app or return to login page if pwd/user incorrect or not found. 
*/

router.post('/', function(req, res){
	var select = {
		user : req.body.username,
		pass : crypto.createHash('sha256').update(req.body.password + conf.salt).digest('hex')
	};
	 db.user.findOne(select, function(err, user) {
    if (!err && user) {
      // Found user register session
      req.session.user = user;
      res.redirect('/home');
    } else {
      // User not found lets go through login again
      res.redirect('/');
    }
 
  });
});

function isAuthenticated(req, res, next) {

	// do any checks you want to in here

	// CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
	// you can do this however you want with whatever variables you set up
	//if (req.session.user.authenticated)
	if (req.isAuthenticated())
		return next();

	// IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
	res.redirect('/');
}
/*************************************************************************************
*	User Management
*************************************************************************************/

router.get('/userlist', function(req, res) {
    res.render('userlist', { title: 'Users' });
});

/* GET New User page. */
router.get('/newuser', isAuthenticated, function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {
    var userName = req.body.username;
    var password = req.body.password;;
	// Generate a salt
	var salt = bcrypt.genSaltSync(10);
	// Hash the password with the salt
	var hash = bcrypt.hashSync(password, salt);
	
	var newUser = new user({
			  username: userName
			, password: hash
			});
			
	newUser.save(function(err, newUser) {
			  if (err) {
				// If it failed, return error
				res.send("There was a problem adding the information to the database.");
			}
			else {
				// If it worked, set the header so the address bar doesn't still say /adduser
				res.location("userlist");
				// And forward to success page
				res.redirect("userlist");
			}
		});
	//});
	

});
module.exports = router;
