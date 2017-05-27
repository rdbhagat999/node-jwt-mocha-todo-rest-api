require('./server/config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const fss = require('fs');
const port = process.env.PORT;

const app = express();

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json 
app.use(bodyParser.json());

// server log
app.use( (req, res, next) => {

	fss.appendFile('./server/log/server.log', `${new Date().toString()} | ${req.method} | ${req.path}` + "\n", (err) => {
		if(err){
			console.log(err);
		}
	});
	next();

});

// set maintainance mode
/*app.use( (req, res, next) => {
	res.status(503).send('The site is in maintainance mode. Check back soon!');
});*/


var {mongoose} = require('./server/db.js');
//require('./config.js');
var {Todo} = require('./server/models/todo.js');
var {User} = require('./server/models/user.js');

var todoRoutes = require('./server/routes/todos.js');
var userRoutes = require('./server/routes/users.js');

app.get('/', (req, res) => {
	res.status(200).send('Hello World!');
});

app.use('/todos', todoRoutes);
app.use('/users', userRoutes);

app.get('*', (req, res) => {
	res.status(404).send('Page not found');
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {
	app:app
};