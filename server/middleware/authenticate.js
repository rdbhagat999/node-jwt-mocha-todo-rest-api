const {User} = require('../models/user.js');

let authenticate = (req, res, next) => {

	let token = req.header('x-auth');
	//console.log('Auth: ', token);

	User.findByToken( token )
		.then( (user) => {
			if(! user) {
				//return Promise.reject();
				//console.log('TOKEN NOT FOUND');
				return res.status(401).send('INVALID');
			}

			req.user = user;
			req.token = token;
			next();
			
		})
		.catch((e) => {
			res.status(401).send();
		});

};

module.exports = {
	authenticate: authenticate
}