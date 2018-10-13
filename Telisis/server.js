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

app.get('/', (req, res) => {
    res.render('yeet.ejs');
});

app.get('/pick_language', (req, res) => {
    res.render('pick_language.ejs');
});

app.get('/pick_language/:lang', (req, res) => {
    app.locals.lang = req.params.lang;
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    console.log(app.locals.lang);
    res.render('realLogin.ejs', {eFail: false, uFail: false, failed: false, language: app.locals.lang});
});

app.post('/loginUser', (req, res) => {
    var query = {username: req.body.username, password: req.body.password};
    db.collection('users').find(query).toArray(function(err, results) {
        if (err) console.log(err);
        if (results.length == 0) {
            res.render('realLogin.ejs', {eFail: false, uFail: false, failed: true, language: app.locals.lang});
        } else {
            app.locals.username = req.body.username;
            res.redirect('/home');
        }
    });
});

app.post('/checkUser', (req, res) => {
    db.collection('users').find({ $or: [ { username: req.body.username }, { email: req.body.email }]}).toArray(function(err, results) {
        if (err) console.log(err);
        if (results.length != 0) { res.render('realLogin.ejs', {uFail: true, eFail: true, failed: false, language: app.locals.lang });  }
        else { 
            db.collection('users').insertOne(req.body, (err, result) => {
                if (err) return console.log(err);
                console.log('saved to database');
                app.locals.username = req.body.username;
                res.redirect('/home');
            });
        }
    });
});

app.get('/home', (req, res) => {
    res.send(app.locals.username);
});