const express = require('express');
const Router = express.Router();
const {ObjectId} = require('mongodb');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const {User} = require('../models/user.js');
const {authenticate} = require('../middleware/authenticate.js');


Router.get('/', (req, res) => {

	User.find({})
		.then( (users) => {

			if(! users) {
				return res.status(404).send();
			}
			res.status(200).send({users});
		},
		(e) => {
			res.status(400).send();
		})
		.catch((e) => {
			//console.log(e);
			res.status(400).send();
		});

});

Router.post('/', (req, res) => {

	let body =  _.pick(req.body, ['email', 'password']);

	let user = new User( body );

	user.save()
		.then((user) => {
			user.generateAuthToken().then((token) => {
				res.header('x-auth', token).status(200).send( {user} );
			});
		})
		.catch((e) => {
			//console.log(e);
			res.status(400).send(e);
		});

});

Router.get('/me', authenticate, (req, res) => {

	res.status(200).send(req.user);

});

Router.delete('/me/token', authenticate, (req, res) => {

	req.user.deleteToken((req.token))
	.then( () => {
		return res.status(200).send();
	})
	.catch((e) => {
		res.status(400).send(e);
	});

});

Router.post('/login', (req, res) => {

	let findUser = _.pick(req.body, ['email', 'password']);
	//res.send(findUser);

	User.findByCredentials(findUser)
	.then((user) => {

		user.generateAuthToken().then((token) => {
			res.header('x-auth', token).status(200).send( {user} );
		});
	})
	.catch((e) => {
		res.status(400).send(e);
	});

});

















module.exports = Router;