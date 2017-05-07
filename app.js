const express = require('express');





const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


// Validate Password Reset Token
app.get('/', function(req, res) {
	res.render('index.ejs');
});


app.listen(process.env.PORT || 3000, function() {
	console.log('App listening on port 3000');
});