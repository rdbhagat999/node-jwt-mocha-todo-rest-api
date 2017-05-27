require('../config/config.js');
const {ObjectId} = require('mongodb');

const {Todo} = require('../models/todo.js');
const {User} = require('../models/user.js');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();
const userThreeId = new ObjectId();

let usersArray = [
	{ 	
		_id: userOneId,
		email: "buyer@email.com",
		password: "passOne",
		tokens: [
		{
			access: "auth",
			token: jwt.sign( { _id: userOneId, access: 'auth'}, process.env.JWT_SECRET ).toString()
		}]
	},
	{ 	
		_id: userTwoId,
		email: "seller@email.com",
		password: "passTwo",
		tokens: [
		{
			access: "auth",
			token: jwt.sign( { _id: userTwoId, access: 'auth'}, process.env.JWT_SECRET ).toString()
		}]
	},
	{ 	
		_id: userThreeId,
		email: "trader@email.com",
		password: "passThree",
		tokens: [
		{
			access: "auth",
			token: jwt.sign( { _id: userThreeId, access: 'auth'}, process.env.JWT_SECRET ).toString()
		}]
	}
];

const populateUsers = (done) => {

  User.remove({}).then(() => {
    
    var userOne = new User(usersArray[0]).save();
    var userTwo = new User(usersArray[1]).save();
    var userThree = new User(usersArray[2]).save();

    return Promise.all([userOne, userTwo, userThree]);
    
  }).then(() => done());
  
};


let firstTodo = new Todo({
	_id: new ObjectId(),
	text: 'Buy home',
	isCompleted: false,
	_userId: userOneId
});

let secondTodo = new Todo({
	_id: new ObjectId(),
	text: 'Sell home',
	isCompleted: false,
	_userId: userTwoId
});


let todosArray = [firstTodo, secondTodo, 
					{
						_id: new ObjectId(),
						text: 'Buy car',
						isCompleted: false,
						_userId: userOneId
					},{
						_id: new ObjectId(),
						text: 'Buy chares',
						isCompleted: false,
						_userId: userOneId
					},{
						_id: new ObjectId(),
						text: 'Buy cold',
						isCompleted: false,
						_userId: userOneId
					},{
						_id: new ObjectId(),
						text: 'Buy tea',
						isCompleted: false,
						_userId: userOneId
					},

					{
						_id: new ObjectId(),
						text: 'Sell tea',
						isCompleted: false,
						_userId: userTwoId
					},{
						_id: new ObjectId(),
						text: 'Sell car',
						isCompleted: false,
						_userId: userTwoId
					},{
						_id: new ObjectId(),
						text: 'Sell gold',
						isCompleted: false,
						_userId: userTwoId
					},{
						_id: new ObjectId(),
						text: 'Sell shares',
						isCompleted: false,
						_userId: userTwoId
					},{
						_id: new ObjectId(),
						text: 'Sell mansion',
						isCompleted: false,
						_userId: userTwoId
					}
				];

const populateTodos = (done) => {

	Todo.remove({})
	.then(() => {
		return Todo.insertMany(todosArray);
	})
	.then( () => {
		done();
	})
};



module.exports = {
	firstTodo: firstTodo,
	secondTodo: secondTodo,
	todosArray: todosArray,
	populateTodos: populateTodos,
	usersArray,
	populateUsers
}