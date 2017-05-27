const express = require('express');
const Router = express.Router();
const {ObjectId} = require('mongodb');
const _ = require('lodash');
const {Todo} = require('../models/todo.js');
const {authenticate} = require('../middleware/authenticate.js');

Router.get('/', authenticate, (req, res) => {

	//console.log('User: ', req.user);

	Todo.find({_userId: req.user._id})
		.then(
			(todos) => {
				res.status(200).send({todos});
			},
			(e) => {
				//console.log('Unable to save: ', e);
				res.status(400).send(e);
			}
		);

});

Router.get('/all', (req, res) => {

	Todo.find({})
		.then(
			(todos) => {
				res.status(200).send({todos});
			},
			(e) => {
				//console.log('Unable to save: ', e);
				res.status(400).send(e);
			}
		);

});

Router.post('/', authenticate, (req, res) => {
	
	//res.json(req.body.text);

	let todo = new Todo({
		_userId: req.user._id,
		text: req.body.text
	});

	todo.save()
		.then(
			(todo) => {
			//console.log(todo);
			res.status(200).send({todo});
			},
			(e) => {
				//console.log('Unable to save: ', e);
				res.status(400).send(e);
			}
		);	

});

Router.get('/:id', authenticate, (req, res) => {

	if( ! ObjectId.isValid(req.params.id) ) {
		return res.status(400).send();
	}

	Todo.findOne( {_id: req.params.id, _userId: req.user._id} )
		.then(
			(todo) => {

				if(! todo){
					return res.status(404).send();
				}
				res.status(200).send({todo});
			},
			(e) => {
				es.status(400).send();
			}
		);

});

Router.put('/:id', authenticate, (req, res) => {

	if( ! ObjectId.isValid(req.params.id) ) {
		return res.status(400).send();
	}

	let upTodo = _.pick(req.body, ['text', 'isCompleted']);

	if(upTodo.isCompleted && _.isBoolean(upTodo.isCompleted)){
		upTodo.completedAt = new Date().getTime();

	}else{

		upTodo.completedAt = null;
		upTodo.isCompleted = false;
	}

	Todo.findOneAndUpdate( {_id: req.params.id, _userId: req.user._id}, {$set: upTodo }, {new: true} )
		.then(
				(todo) => {
					if(! todo){
						return res.status(404).send();
					}
					//console.log(todo);
					res.send({todo});
				},
				(e) => {
					res.status(400).send();
				}
			);
				
});

Router.delete('/:id', authenticate, (req, res) => {

	if( ! ObjectId.isValid(req.params.id) ) {
		return res.status(400).send();
	}

	Todo.findOneAndRemove( {_id: req.params.id, _userId: req.user._id} )
		.then( 
			(todo) => {

				if(! todo){
					return res.status(404).send();
				}
				//console.log(todo);
				res.status(200).send({todo});
			},
			(e) => {
				//console.log('Unable to delete: ', e);
				res.status(400).send();
			}
		);
});

module.exports = Router;