const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.get('/', (req, res) => {
	res.send(database.users);
});

app.post('/signin', (req, res) => {
	if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
		res.json(database.users[0]);
	}
	else {
		res.status(400).json('error logging in');
	}
});

app.post('/register', (req, res) => {
	database.users.push({
		id       : '125',
		name     : req.body.name,
		email    : req.body.email,
		password : req.body.password,
		entries  : 0,
		joined   : new Date()
	});
	res.json(database.users[database.users.length - 1]);
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;

	for (let user of database.users) {
		if (user.id === id) {
			return res.json(user);
		}
	}

	res.status(404).json('no such user');
});

app.put('/image', (req, res) => {
	const { id } = req.body;

	for (let user of database.users) {
		if (user.id === id) {
			user.entries++;
			return res.json(user.entries);
		}
	}

	res.status(404).json('no such user');
});

// bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
// 	console.log('---', hash);
// });

// Load hash from your password DB.
// bcrypt.compare(myPlaintextPassword, hash, function(err, result) {
// 	// result == true
// });
// bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result) {
// 	// result == false
// });

app.listen(3001, () => {
	console.log('app is running on port 3001');
});
