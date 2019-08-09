/*
SERVER SETUP FOR COLLOABORATIVE_TEXT_EDITOR
THIS IS THE BACKEND FILE

*/
var express = require('express');
var app = express();
var models = require('../models');
var logger = require('morgan');
var path = require('path');
// var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('underscore');
var cors = require('cors');

const whitelist = ['http://localhost:8080'];
app.use(
	cors({
		origin: function(origin, callback) {
			if (whitelist.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true
	})
);

// view engine setup
app.set('components', path.join(__dirname, 'views'));
// app.set("view engine", "hbs");

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../../client/build')));

app.use(
	session({
		secret: process.env.SECRET,
		store: new MongoStore({ mongooseConnection: mongoose.connection }), // this is where we r storing our session info in the mongo database
		proxy: true,
		saveUninitialized: true,
		resave: true
	})
);

//MIDDLEWARE
var unless = (path, middleware) => {
	return (req, res, next) => {
		if (path.includes(req.path)) {
			return next();
		}
		return middleware(req, res, next);
	};
};

var validateLoggedIn = (req, res, next) => {
	if (!req.session.user) {
		res.status(401).json({ error: true, message: 'NOT LOGGED IN' });
		return;
	} else {
		next();
	}
};

app.use(unless(['/', '/login', '/signup'], validateLoggedIn));

// POST registration page
var validateReq = function(userData) {
	return userData.password === userData.passwordRepeat;
};

app.post('/signup', function(req, res) {
	if (!validateReq(req.body)) {
		return res.json({
			error: true,
			message: 'Error on post request to sign up'
		});
	}
	var u = new models.User({
		email: req.body.email,
		password: req.body.password,
		displayName: req.body.displayName
	});

	u.save(function(err, user) {
		if (err) {
			console.log(err);
			return res.json({
				error: true,
				message: 'Error saving to the database'
			});
		}
		res.json({ error: false, user: user });
	});
});

// POST Login page

app.post('/login', (req, res) => {
	const { email, password } = req.body;

	models.User.findOne({ email: email }, (err, user) => {
		//database error
		if (err) {
			console.log(err);
			return res.status(401).json({
				error: true,
				message: 'ERROR WHILE FINDING ' + err
			});
		}
		//passwords dont match
		if (!user || user.password !== password) {
			res.status(401);
			console.log('passwords dont match');
			return res.json({
				error: true,
				message: err
			});
		}

		//all the stuff we store in the database
		// sets the user on the session
		req.session.user = user;
		return res.json({
			error: false
		});
	});
});

//ALREADY LOGGED IN ROUTE \\//
app.get('/login', (req, res) => {
	//user persistence
	res.status(200).json({ error: false, isLogged: Boolean(req.session.user) });
});

// GET Logout page
app.post('/logout', function(req, res, next) {
	// lOGS USER OUT
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				return next(err);
			} else {
				return res.json({ success: true });
			}
		});
	}
});

app.post('/docs/new', (req, res) => {
	var doc = new models.Document({
		author: req.session.user._id,
		collaborators: [req.session.user._id],
		title: req.body.title,
		password: req.body.password
	});
	doc.save((err, document) => {
		//saves the documents to the database
		if (err) {
			console.log(err);
			return res.status(401).json({
				error: true,
				message: 'ERROR WHILE SAVING DOCUMENT ' + err
			});
		}
		//when saving we return with a json respresentation of the documents
		res.json({ error: false, title: document.title, id: document._id });
	});
});

app.post('/docs/shared', (req, res) => {
	models.Document.findById(req.body.id, (err, document) => {
		if (err) {
			console.log(err);
			return res
				.status(401)
				.json({ error: true, message: 'Invalid document ID' });
		}
		if (req.body.password === document.password) {
			if (document.collaborators.includes(req.session.user._id)) {
				res.json({
					error: false,
					success: false,
					message: 'Already a collaborator'
				});
			} else {
				document.collaborators.push(req.session.user._id);
				document.save(err => {
					if (err) {
						res.status(401).json({
							error: true,
							message: 'Failed to add collaborator'
						});
					} else {
						res.json({
							error: false,
							success: true,
							title: document.title,
							id: document._id
						});
					}
				});
			}
			// send the document title and id
		} else {
			res.json({
				error: false,
				success: false,
				message: 'Invalid document password'
			});
		}
	});
});

app.get('/docs', (req, res) => {
	// Route that sends all the docs
	models.Document.find(
		{ collaborators: req.session.user._id },
		(err, docs) => {
			if (err) {
				console.log('ERROR FINDING TH DOCS IN THE DATABASE');
			}
			//map through the docs and only get certain infromation \\//
			docs = docs.map(document => {
				return { title: document.title, id: document._id };
			});
			return res.status(200).json({ error: false, docs: docs });
		}
	);
});

// SOCKET BELOW \\// \\//
io.on('connection', socket => {
	socket.on('joinDoc', id => {
		socket.join(id);
	});

	socket.on('leaveDoc', id => {
		socket.leave(id);
	});

	socket.on('changeDoc', ({ docId, data, selectData }) => {
		io.to(docId).emit('changeDoc', { data, selectData }); // id = room , data = content
	});

	socket.on('saveDoc', ({ content, id }) => {
		models.Document.findById(id, (err, document) => {
			if (err) {
				console.log('ERROR FINDING THE DOCUMENT');
			} else {
				document.content = content;
				document.save(err => {
					if (err) {
						console.log('ERROR SAVING THE DOCUMENT');
					}
				});
			}
		});
	});

	socket.on('loadDoc', id => {
		models.Document.findById(id, (err, document) => {
			if (err) {
				console.log('ERROR FINDING THE DOCUMENT WHEN TRYING TO LOAD');
			} else {
				socket.emit('loadDoc', {
					title: document.title,
					content: document.content
				});
				// send the document content //\\
			}
		});
	});

	socket.on('editTitle', ({ id, title }) => {
		models.Document.findById(id, (err, document) => {
			if (err) {
				console.log('ERROR FINDING THE DOCUMENT WHEN CHANGING TITLE ');
			} else {
				document.title = title;
				document.save(err => {
					if (err) {
						console.log(
							'ERROR SAVING THE DOCUMENTS NEW TITLE',
							err
						);
					}
				});
			}
		});
	});
});

// app.use(function(req, res, next) {
//   var err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

const port = process.env.port || 3000;
server.listen(port, function() {
	console.log('Listening on %s', port);
});
