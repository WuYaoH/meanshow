var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var crypto = require('crypto');


// Connection URL
var url = 'mongodb://localhost:27017/test';
var ObjectID = mongodb.ObjectId;

var items = [
    {"name": "成员管理", "price": 15, "selected": false},
    {"name": "科目管理", "price": 12, "selected": false},
    {"name": "班期管理", "price": 13, "selected": false},
    {"name": "考核管理", "price": 14, "selected": false},
    {"name": "查询统计", "price": 11, "selected": false}
]


router.get('/api/items', function (req, res) {
    res.json(items);
});

//===================================================================================================
/*
 * init mongodb*/
MongoClient.connect(url, function (err, db) {
    var users = db.collection('user');
    users.indexExists('usernameIndex', function (err, result) {
        if (!result) {
            users.createIndex({username: 1}, {unique: true, name: "usernameIndex"}, function (err) {
                //if (err) throw err;
                if (err) {
                    console.log(err);
                }
            });
        }
    });
    users.indexExists('access_tokenIndex', function (err, result) {
        if (!result) {
            users.createIndex({access_token: 1}, {unique: true, name: "access_tokenIndex"}, function (err) {
                //if (err) throw err;
                if (err) {
                    console.log(err);
                }
            });
        }
    });
});

/*register & sign in/out
 */
router.post('/register', function (req, res, next) {
    //Register
    var registerUser = function (db, callback) {
        var users = db.collection('user');
        var sha1sum = crypto.createHash('sha1');
        sha1sum.update(req.body.username + req.body.password + new Date().getTime());
        var accessToken = sha1sum.digest('hex');
        users.insertOne({
            username: req.body.username,
            password: req.body.password,
            role: "tenant",
            access_token: accessToken
        }, function (err, result) {
            if (!err) {
                console.log("register success");
                callback(result);
            }
            else {
                console.log("register failure");
                res.status(409).end();
                db.close();
            }

        });
    };

    MongoClient.connect(url, function (err, db) {
        console.log("Connected correctly to server");
        registerUser(db, function () {
                res.status(201);
                res.json({msg: 'success'});
                db.close();
            }
        )
    });
});

router.post('/signin', function (req, res, next) {
    //Sign
    var signUser = function (db, callback) {
        var user = db.collection('user');
        var sha1sum = crypto.createHash('sha1');
        sha1sum.update(req.body.username + req.body.password + new Date().getTime());
        var accessToken = sha1sum.digest('hex');
        user.findOneAndUpdate(
            {
                username: req.body.username,
                password: req.body.password
            },
            {
                $set: {
                    access_token: accessToken
                }
            },
            function (err, result) {
                if (!err && (result.value != null)) {
                    console.log('sign in success');
                    callback(result);
                }
                else {
                    console.log('sign in failure');
                    res.status(401).end();
                    db.close();
                }
            });
    };

    MongoClient.connect(url, function (err, db) {
        console.log("Connected correctly to server");
        signUser(db, function (result) {
            console.dir(result);
            res.status(200);
            res.json(result);
            db.close();
        });
    });
});


//paid
router.post('/pay', function (req, res, next) {
    //Sign
    var payUser = function (db, callback) {
        var user = db.collection('user');
        user.findOneAndUpdate(
            {
                username: req.body.username,
                password: req.body.password
            },
            {
                $set: {
                    paid: req.body.paid,
                    group: req.body.group
                }
            },
            {
                upsert: true
            }
            ,
            function (err, result) {
                if (!err && (result.value != null)) {
                    console.log('pay success');
                    callback(result);
                }
                else {
                    console.log('pay failure');
                    res.status(401).end();
                    db.close();
                }
            }
        )
        ;
    };

    MongoClient.connect(url, function (err, db) {
        console.log("Connected correctly to server");
        payUser(db, function (result) {
            console.dir(result);
            res.status(200);
            res.json(result);
            db.close();
        });
    });
});


module.exports = router;