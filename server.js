const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const knex = require('knex');

const db = knex({
	client     : 'pg',
	connection : {
		host     : '127.0.0.1',
		user     : 'rohanbatra',
		password : '',
		database : 'face-recog'
	}
});

const database = {
	users : [
		{ id: '123', name: 'John', email: 'john@gmail.com', password: 'cookies', entries: 0, joined: new Date() },
		{ id: '124', name: 'Sally', email: 'sally@gmail.com', password: 'bananas', entries: 0, joined: new Date() }
	]
};

const app = express();

app.use(bodyParser.json());
app.use(cors());

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.get('/', (req, res) => {
	res.send(database.users);
});

app.post('/signin', (req, res) => {
	db
		.select('email', 'hash')
		.from('login')
		.where('email', '=', req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

			if (isValid) {
				return db
					.select('*')
					.from('users')
					.where('email', '=', req.body.email)
					.then((user) => res.json(user[0]))
					.catch((err) => res.status(400).json('unable to get user'));
			}
			else {
				res.status(400).json('wrong credentials');
			}
		})
		.catch((err) => res.status(400).json('wrong credentials'));
});

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;

	const hash = bcrypt.hashSync(password, saltRounds);
	db
		.transaction((trx) => {
			trx
				.insert({
					hash  : hash,
					email : email
				})
				.into('login')
				.returning('email')
				.then((loginEmail) => {
					return trx('users')
						.returning('*')
						.insert({
							email  : loginEmail[0],
							name   : name,
							joined : new Date()
						})
						.then((user) => {
							res.json(user[0]);
						});
				})
				.then(trx.commit)
				.catch(trx.rollback);
		})
		.catch((err) => res.status(400).json('unable to register'));
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;

	db
		.select('*')
		.from('users')
		.where({
			id : id
		})
		.then((user) => {
			if (user.length) {
				res.json(user[0]);
			}
			else {
				res.status(400).json('not found');
			}
		})
		.catch((err) => res.status(400).json('error getting user'));
});

app.put('/image', (req, res) => {
	const { id } = req.body;

	db('users')
		.where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then((entries) => res.json(entries[0]))
		.catch((err) => res.status(400).json('unable to get entries'));
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
