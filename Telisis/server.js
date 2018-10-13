const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

var uri = 'mongodb+srv://dkhurana:notaarat@cluster0-xtvcc.mongodb.net/test?retryWrites=true';


MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
    //const collection = client.db("test").collection("devices");
    // perform actions on the collection object
     if(err) return console.log(err);
     db = client.db('TelesisDB');
     app.listen(8080);
     //client.close();
 });

app.set('viewengine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.get('/login', (req, res) => {
    res.render('login.ejs', {failed: false});
});

app.post('/loginUser', (req, res) => {
    var query = {username: req.body.username, password: req.body.password};
    db.collection('users').find(query).toArray(function(err, results) {
        if (err) console.log(err);
        if (results.length == 0) {
            res.render('login.ejs', {failed: true});
        } else {
            app.locals.username = req.body.username;
            res.redirect('/home');
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register.ejs', {pFail: false, eFail: false, uFail: false});
});

app.post('/registerUser', (req, res) => {

    var passwordsFail = false;
    var usernameFail = false;
    var emailFail = false;
    
    if(req.body.password != req.body.confirm) {
        passwordsFail = true;
    }
    db.collection('users').find({username: req.body.username}).toArray(function(err, results) {
        if (err) console.log(err);
        if (results.length > 0) { usernameFail = true; }
    });
    db.collection('users').find({email: req.body.email}).toArray(function(err, results) {
        if (err) console.log(err);
        if (results.length > 0) { emailFail = true; }
    });

    if(passwordsFail || usernameFail || emailFail) { 
        res.render('register.ejs', {pFail: passwordsFail, uFail: usernameFail, eFail: emailFail }); 
    } else {
        var userInfo = {username: req.body.username, email: req.body.email, password: req.body.password};
        db.collection('users').insertOne(userInfo, (err, result) => {
            if (err) return console.log(err);
            console.log('saved to database');
            app.locals.username = req.body.username;
            res.redirect('/home');
        });
    }

});

app.get('/home', (req, res) => {
    res.send(app.locals.username);
});