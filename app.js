// MODULES
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// STRIPE
const stripeSK = process.env.PORT ? process.env.STRIPE_LIVE_SK : process.env.STRIPE_TEST_SK;
const stripe = require('stripe')(stripeSK);

console.log(process.env);

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
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Home page
app.get('/', function(req, res) {
	Marble.find({}).sort({color: -1}).exec(function (err, marbles) {
  	if (err) console.log(err);

  	const availableMarbles = marbles.filter(function(marble) {
  		return !marble.userGivenName;
  	});

  	const ownedMarbles = marbles.filter(function(marble) {
  		return marble.userGivenName;
  	});

  	res.render('index.ejs', { availableMarbles: availableMarbles });
  });
});

// Stripe charge
app.post('/charge', function(req, res) {
	console.log('/charge');
	console.log(req.body);

  stripe.customers.create({
	  description: 'Customer: ' + req.body.stripeEmail,
	  source: req.body.stripeToken,
	  email: req.body.stripeEmail,
	}, function(err, customer) {
		if (err) console.log(err);
		console.log(customer);
		stripe.charges.create({
		  amount: 500,
		  currency: 'usd',
		  customer: customer.id,
		  description: 'Charge for ' + req.body.stripeEmail,
		}, function(err, charge) {
			if (err) console.log(err);
			Marble.find({ color: req.body.marbleColor }).exec(function (err, marble) {
		  	if (err) console.log(err);
		  	marble.userGivenName = req.body.userGivenName;
				marble.save(function(err) {
          if (err) console.log(err);
					console.log('Charge created for ' + marble.color);
					res.sendStatus(200);
        });
		  });
	  });
	});
});




app.listen(process.env.PORT || 3000, function() {
	console.log('App listening on port 3000');
});