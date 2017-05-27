const exp = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('../../index.js');
const {Todo} = require('../models/todo.js');
const {User} = require('../models/user.js');
const {firstTodo, secondTodo, populateTodos, usersArray, populateUsers} = require('./seed.test.js');

let id = new ObjectId();

beforeEach(populateUsers);
beforeEach(populateTodos);

describe(`Todos TEST Suite \n   ************** \n`, () => {

	describe(`Todos GET Requests: \n`, () => {

		it(`should list all todos with response 200 \n`, (done) => {
			//console.log('SENT: ', usersArray[0]);
			request(app)
				.get('/todos')
				.set('x-auth', usersArray[0].tokens[0].token)
				.expect(200)
				.expect( (res) => {
					exp(res.body.todos).toBeA('array');
					exp(res.body.todos.length).toBe(5);
				})
				.end(done);

		});

		it(`should get TODO By ID with response 200 \n`, (done) => {

			request(app)
				.get(`/todos/${secondTodo._id}`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(200)
				.expect( (res) => {
					exp(res.body.todo).toBeA('object');
					exp(res.body.todo.text).toBe(secondTodo.text);
				})
				.end(done);

		});

		it(`should return response 404 with VALID Id \n`, (done) => {

			request(app)
				.get(`/todos/${new ObjectId()}`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(404)
				.end(done);

		});

		it(`should return response 400 with INVALID Id \n`, (done) => {

			request(app)
				.get(`/todos/123`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(400)
				.end(done);

		});

	});

	// Post checked
	describe(`Todos POST Requests: \n`, () => {

		it(`should save todo with response 200 \n`, (done) => {

			let thirdTodo = new Todo({
				text: 'Third todo'
			});


			request(app)
				.post('/todos/')
				.set('x-auth', usersArray[1].tokens[0].token)
				.send( thirdTodo )
				.expect(200)
				.expect( (res) => {
					exp( res.body.todo ).toBeA('object');
					exp( res.body.todo.text ).toBe( thirdTodo.text );
				})
				.end( (err, res) => {
					if(err)	{
						return done(err);
					}

					Todo.findOne({text: thirdTodo.text})
					.then( (todo) => {
						exp(todo.text).toBe( thirdTodo.text );
						done();
					})
					.catch((e) => {
						done(e);
					});
				});

		});

		it(`should not save todo with response 400 \n`, (done) => {

			let todo = { test: 'test todo'}

			request(app)
				.post('/todos')
				.set('x-auth', usersArray[0].tokens[0].token)
				.send( todo )
				.expect(400)
				.end( (err, res) => {

					if(err){
						return done();
					}

					Todo.find()
						.then( (todos) => {
							exp(todos).toBeA('array');
							exp(todos.length).toBe(11);
							done();
						})
						.catch((e) => {
							done(e);
						});
				});

		});

	});

	// Put checked
	describe('Todos PUT Requests: \n', () => {

		it(`should respond with 400 if INVALID Id \n`, (done) => {

			request(app)
				.put(`/todos/123`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.send(firstTodo)
				.expect(400)
				.end(done)
		});

		it(`should response 404 with VALID Id \n`, (done) => {

			request(app)
				.put(`/todos/${usersArray[1]._id}`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(404)
				.end(done);
		});

		it(`should update todo by ID with response 200 \n`, (done) => {

			firstTodo.isCompleted = true;
			firstTodo.text = "HelloWorld";

			request(app)
				.put(`/todos/${firstTodo._id}`)
				.set('x-auth', usersArray[0].tokens[0].token)
				.send(firstTodo)
				.expect(200)
				.expect( (res) => {
					exp(res.body.todo).toBeA('object');
					exp(res.body.todo.text).toBeA('string');
					exp(res.body.todo.text).toBe(firstTodo.text);
					exp(res.body.todo.isCompleted).toBe(true);
					exp(res.body.todo.completedAt).toBeA('number');
				})
				.end(done);
		});

		it(`should update and clear completedAt with response 200 \n`, (done) => {

			firstTodo.isCompleted = false;
			firstTodo.text = "HelloWorld";

			request(app)
				.put(`/todos/${firstTodo._id}`)
				.set('x-auth', usersArray[0].tokens[0].token)
				.send(firstTodo)
				.expect(200)
				.expect( (res) => {
					exp(res.body.todo).toBeA('object');
					exp(res.body.todo.text).toBeA('string');
					exp(res.body.todo.text).toBe(firstTodo.text);
					exp(res.body.todo.isCompleted).toBe(false);
					exp(res.body.todo.completedAt).toNotExist();
				})
				.end(done);
		});

	});

	// Delete checked
	describe(`Todos DELETE Requests: \n`, () => {

		it(`should delete todo by ID with response 200 \n`, (done) => {

			request(app)
				.delete(`/todos/${secondTodo._id}`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(200)
				.expect( (res) => {
					exp(res.body.todo._id).toBeA('string');
					exp(res.body.todo._id).toBe(`${secondTodo._id}`);
				})
				.end((err, res) => {
					if(err){
						return done(err);
					}

					Todo.findById(secondTodo._id)
						.then( (todo) => {
							exp(todo).toNotExist();
							done();
						})
						.catch( (e) => {
							done(e);
						});

				});
		});

		it(`should return response 404 with VALID Id \n`, (done) => {

			request(app)
				.delete(`/todos/${id}`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(404)
				.end(done);

		});

		it(`should return response 400 with INVALID Id \n`, (done) => {

			request(app)
				.delete(`/todos/123`)
				.set('x-auth', usersArray[1].tokens[0].token)
				.expect(400)
				.end( done );

		});

	});

});


describe(`Users TEST Suite \n   ************** \n`, () => {
	

	describe('Users GET Requests', () => {

		it(`should return user if authenticated \n`, (done) => {

			//console.log(usersArray[0].tokens);

			request(app)
				.get('/users/me')
				.set('x-auth', usersArray[0].tokens[0].token)
				.expect(200)
				.expect( (res) => {
					exp(res.body._id).toBe(usersArray[0]._id.toHexString());
					exp(res.body.email).toBe(usersArray[0].email);
				})
				.end(done);

		});

		it(`should return 401 if not authenticated \n`, (done) => {

			request(app)
			.get('/users/me')
			.expect(401)
			.expect( (res) => {
				exp(res.body).toEqual( {} );
			})
			.end(done);

		});

	});

	describe('Users POST Requests', () => {

		it(`should save user \n`, (done) => {

			let testUser = {
				email: 'tt3@email.com',
				password: '1234567'
			};

			request(app)
				.post('/users')
				.send( testUser )
				.expect(200)
				.expect( (res) => {
					exp(res.headers['x-auth']).toExist();
					exp(res.body.user._id).toExist();
					exp(res.body.user.email).toBe(testUser.email);
				})
				.end((err) => {
					if(err) return done(err);

					User.findOne({email:testUser.email})
						.then((user) => {
							exp(user).toExist();
							exp(user.email).toBe(testUser.email);
							exp(user.password).toNotBe(testUser.password);
							done();
						})
						.catch((e) => {
							done(e);
						});
				});

		});

		it(`should return validation errors \n`, (done) => {

			let saveUser = {
				email: 'tt3',
				password: '123'
			};

			request(app)
				.post('/users')
				.send( saveUser )
				.expect(400)
				.expect((res) => {
					exp(res.body.errors.email).toExist();
					exp(res.body.errors.password).toExist();
				})
				.end(done);


		});

		it(`should not save user if email in use \n`, (done) => {

			request(app)
				.post('/users')
				.send( { email: usersArray[0].email, password: '1234567'} )
				.expect(400)
				.end(done);

		});

		it(`should login user and return auth token with valid credentials \n`, (done) => {
			
			let validUser = usersArray[0];
			//console.log(validUser);

			request(app)
				.post('/users/login')
				.set('x-auth', validUser.tokens[0].token)
				.send( { email: validUser.email, password: validUser.password} )
				.expect(200)
				.expect( (res) => {
					exp(res.headers['x-auth']).toExist();
					exp(res.body.user).toExist();
					exp(res.body.user._id).toBe(validUser._id.toHexString());
					exp(res.body.user.email).toBe(validUser.email);
				})
				.end((err, res) => {
					if(err) {
						return done(err);
					}

					User.findById(validUser._id)
						.then( (user) => {
							exp(user).toExist();
							exp(user.tokens[0].access).toBe('auth');
							exp(user.tokens[0].token).toBeA('string');
							exp(user.tokens[0].token).toBe(res.headers['x-auth']);
							done();

						})
						.catch((e) => {
							return done(e);
						});

				});

		});

		it(`should not login with invalid credentials \n`, (done) => {

			let invalidEmail = 'invalid@email.com';
			let pwd = 'qwertysd';

			request(app)
				.post('/users/login')
				.send( { email: invalidEmail, password: pwd } )
				.expect(400)
				.expect( (res) => {
					exp(res.headers['x-auth']).toNotExist();
					exp(res.body.user).toNotExist();
				})
				.end((err, res) => {
					if(err) {
						return done(err);
					}

					User.findOne({email:invalidEmail})
						.then( (user) => {
							exp(user).toNotExist();
							done();

						})
						.catch((e) => {
							return done(e);
						});

				});

		});

	});

	// describe('Users PUT Requests', () => {

	// });

	describe('Users DELETE Requests', () => {

		it(`should delete user \n`, (done) => {

			let testUser = usersArray[2];
			//console.log(testUser);

			request(app)
				.delete('/users/me/token')
				.set('x-auth', testUser.tokens[0].token)
				.expect(200)
				.expect( (res) => {
					exp(res.headers['x-auth']).toNotExist();
					exp(res.body.user).toNotExist();
				})
				.end((err) => {
					if(err) return done(err);

					User.findById({_id: testUser._id})
						.then((user) => {
							exp(user).toExist();
							exp(user.email).toBe(testUser.email);
							exp(user.tokens).toBeA("array");
							exp(user.tokens.length).toBe(0);
							done();
						})
						.catch((e) => {
							done(e);
						});
				});

		});

	});

});