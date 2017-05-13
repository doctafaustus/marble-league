// MODULES
const express = require('express');

// STRIPE
const stripeSK = process.env.PORT ? process.env.STRIPE_LIVE_SK : process.env.STRIPE_TEST_SK;
const stripe = require('stripe')(stripeSK);

// DATABASE
const mongoose = require('mongoose');
const uriUtil = require('mongodb-uri');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const dbOptions = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };
mongoose.Promise = global.Promise; // Removes decprecation warning

// Connect to DB
if (!process.env.PORT) {
	mongoose.connect('mongodb://localhost/marble_racing_league');
} else {
	console.log("Application running in Heroku!");
	const mongodbUri = process.env.MONGODB_URI; // A Heroku config variable
	const mongooseUri = uriUtil.formatMongoose(mongodbUri);
	mongoose.connect(mongooseUri, dbOptions);
}

const Marble = mongoose.model('Marble', new Schema({
	id: ObjectId,
	color: String,
	userGivenName: String,
}));


const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


app.get('/', function(req, res) {

	Marble.find({}).sort({color: -1}).exec(function (err, marbles) {
  	if (err) throw err;

  	const availableMarbles = marbles.filter(function(marble) {
  		return !marble.userGivenName;
  	});

  	const ownedMarbles = marbles.filter(function(marble) {
  		return marble.userGivenName;
  	});

  	res.render('index.ejs', { availableMarbles: availableMarbles });
  });

});


app.listen(process.env.PORT || 3000, function() {
	console.log('App listening on port 3000');
});