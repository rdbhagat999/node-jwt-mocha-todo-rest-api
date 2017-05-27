const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({

					email: {
						type: String,
						required: true,
						minlength: [3, 'Minimum length must be 3'],
						trim: true,
						unique: true,
						validate: {
							validator: (email) => {
								return validator.isEmail( email );
							},
							message: `{VALUE} is not a valid email address!`
						}
					},
					password: {
						type: String,
						required: true,
						minlength: [6, 'Minimum length must be 6']
					},
					tokens: [
						{
							access: {
								type: String,
								required: true
							},
							token: {
								type: String,
								required: true
							}
						}
					]

				});

UserSchema.methods.toJSON = function() {
	// method overide

	let user = this;
	let userObject = user.toObject();
	return _.pick( userObject, ['_id', 'email']);

};

UserSchema.methods.generateAuthToken = function() {
	
	let user = this;
	let access = "auth";
	let token = jwt.sign({
							_id: user._id.toHexString(),
							access: access
						}, process.env.JWT_SECRET )
						.toString();
	user.tokens = [];
					
	user.tokens.push({
		access: access,
		token:token
	});

	return user.save().then( () => {
			return token;
		});
}

UserSchema.methods.deleteToken = function( token ) {
	
	let user = this;

	return user.update({ 
		$pull: {
				tokens: {
					token: token
				}
		}
		},{ new: true}
	);
}

UserSchema.statics.findByToken = function( token ) {

	let User = this;
	let decoded = null;

	try {

		decoded = jwt.verify(token, process.env.JWT_SECRET);

	}catch( e ) {
		return Promise.reject(e);
	}

	return User.findOne({ 
		_id: decoded._id,
		'tokens.access': 'auth',
		'tokens.token': token  
	});

};

UserSchema.statics.findByCredentials = function( findUser ) {

	let User = this;

	return User.findOne({email: findUser.email})
	.then((user) => {

		if(!user){
			return Promise.reject('401: Unauthorized');
		}

		// bcryptjs only supports callbacks, that is why we need to create a new Promise.
		return new Promise( (resolve, reject) => {

			bcrypt.compare(findUser.password, user.password, function(err, res) {
			    
				if(res) {
					//console.log('login success');
					return resolve(user);
				}else{
					return reject('401: Unauthorized');
				}

			});

		});

	});

};

UserSchema.pre('save', function(next) {
  
	let user = this;

	if( user.isModified('password') ) {

		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(user.password, salt, function(err, hash) {
		        // Store hash in your password DB.
		        user.password = hash;
		        next();
		        
		    });
		});

	}else{

		next();
	}

});



const User = mongoose.model('User', UserSchema);

module.exports = {
	User:User
}