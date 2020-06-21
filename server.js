const express = require('express');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const database = {
	users : [
		{ id: '123', name: 'John', email: 'john@gmail.com', password: 'cookies', entires: 0, joined: new Date() },
		{ id: '124', name: 'Sally', email: 'sally@gmail.com', password: 'bananas', entires: 0, joined: new Date() }
	]
};

app.get('/', (req, res) => {
	res.send(database.users);
});

app.post('/signin', (req, res) => {
	if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
		res.json('success');
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
		entires  : 0,
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
			user.entires++;
			return res.json(user.entires);
		}
	}

	res.status(404).json('no such user');
});

app.listen(3001, () => {
	console.log('app is running on port 3001');
});
