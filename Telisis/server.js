const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var uri = 'mongodb+srv://dkhurana:notaarat@cluster0-xtvcc.mongodb.net/test?retryWrites=true';


MongoClient.connect(uri, {useNewUrlParser: true}, function(err, client) {
    //const collection = client.db("test").collection("devices");
    // perform actions on the collection object
     if(err) return console.log(err);
     db = client.db('TelesisDB');
     http.listen(3000, function() {
        console.log('listening on *:3000');
     });
     //client.close
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
        if (results.length != 0) { res.render('realLogin.ejs', {uFail: true, eFail: true, failed: false });  
        } else { 
            db.collection('users').insertOne(req.body, (err, result) => {
                if (err) return console.log(err);
                console.log('saved to database');
                app.locals.name = req.body.name;
                app.locals.password = req.body.password;
                app.locals.email = req.body.email;
                app.locals.username = req.body.username;
                res.redirect('/questionaire');
            });
        }
    });
});

app.get('/questionaire', (req, res) => {
    res.render('qnaire.ejs');
});

app.post('/question', (req, res) => {
    app.locals.userObject = { username: app.locals.username, password: app.locals.password, email: app.locals.email,
        name: app.locals.name, pictureUrl: req.body.pictureUrl, zip: parseInt(req.body.zip), location: req.body.location, primaryLanguage: req.body.primaryLanguage,
        isFamily: req.body.isFamily, years: parseInt(req.body.years), country: req.body.country, religion: req.body.religion,
        industry: req.body.industry, haveKids: req.body.haveKids };
    db.collection('users').findOneAndReplace( { username: app.locals.username}, 
        app.locals.userObject, (err, results) => {
            if (err) return console.log(err);
            console.log(results);
            console.log('saved to database');
            res.redirect('/home')
        });
    /*db.collection('users').updateOne({username: app.locals.username}, req.body, (err, result) => {
        if (err) return console.log(err);
        console.log('saved to database');
        res.redirect('/home');
    }); */
});

app.get('/home', (req, res) => {
    db.collection('users').findOne({username: app.locals.username}, (err, result) => {
        if (err) return console.log(err);
        console.log(result);
        //{ $range: [ result.zip - 15, result.zip + 15 ] }
        db.collection('users').find({zip: { $gt: result.zip - 15, $lt: result.zip + 15 }}).toArray((err, arrResults) => {
            var count = 0;
            for(var i = 0; i < arrResults.length; i++) {
                if(result.isFamily.trim().valueOf() == arrResults[i].isFamily.trim().valueOf()) { count += 50; }
                if (Math.abs(result.years - arrResults[i].years) <= 1 || result.username.trim().valueOf() == arrResults[i].username.trim().valueOf()) {
                    count = 0;
                    arrResults.splice(i, 1);
                    i--;
                    continue;        
                } else {
                    count += 14 * Math.abs(result.years - arrResults[i].years);
                    if(result.country.trim().valueOf() == arrResults[i].country.trim().valueOf()) {count += 400;}
                    if(result.primaryLanguage.trim().valueOf() == arrResults[i].primaryLanguage.trim().valueOf()) {count += 150;}
                    if(result.religion.trim().valueOf() == arrResults[i].religion.trim().valueOf()) {count += 150;}
                    if(result.industry.trim().valueOf() == arrResults[i].industry.trim().valueOf()) {count += 100;}
                    if(result.haveKids.trim().valueOf() == arrResults[i].haveKids.trim().valueOf()) {count += 100;}
                }
                arrResults[i]['weight'] = count;
                count = 0;
            }
            arrResults.sort((a, b) => { return b.weight >= a.weight });
            arrResults.sort();
            console.log(arrResults);
            res.render('matching.ejs', {results: arrResults});
        });
    });
});

var connections = [];

app.get('/chat/:otherUser', function(req, res) {

    var other = req.params.otherUser;
    var thisUser = app.locals.username;

    var arr = [other, thisUser];
    arr.sort();

    res.redirect('/chat/between/' + arr[0] + arr[1]);
});

app.get('/chat/between/:lobby', (req, res) => {
    var newLobby = req.params.lobby;

    io.sockets.on('connection',(socket) => {
        connections.push(socket);
        console.log(' %s sockets is connected', connections.length);
     
        socket.on('disconnect', () => {
           connections.splice(connections.indexOf(socket), 1);
        });
     
        socket.on('sending message', (message) => {
           console.log('Message is received :', message);
           io.sockets.emit('new message', {message: message});
        });
    }); 
    res.render('chatLobby.ejs');
});


