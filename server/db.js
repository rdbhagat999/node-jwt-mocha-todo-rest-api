var mongoose = require('mongoose');
const username = 'admin';
const pwd = 'admin';
const db = 'noderestapi';

mongoose.Promise = global.Promise;
//mongoose.connect(`mongodb://admin:admin@noderestapi-shard-00-00-gvgx9.mongodb.net:27017,noderestapi-shard-00-01-gvgx9.mongodb.net:27017,noderestapi-shard-00-02-gvgx9.mongodb.net:27017/noderestapi?ssl=true&replicaSet=nodeRestApi-shard-0&authSource=admin`);

//mongoose.connect(process.env.MONGODB_URI);
mongoose.connect(`mongodb://localhost:27017/noderestapi`);

module.exports = {
	mongoose: mongoose
}