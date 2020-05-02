let express = require("express");
let bodyParser= require("body-parser");
let mysql = require("mysql");
let session = require('express-session');
//let passport = require('passport');
//let cookieParser = require('cookie-parser');
//let flash = require('connect-flash');
//let env = require('dotenv').load();   ///dot-env для обработки переменных среды.


let urlencodedParser = bodyParser.urlencoded({ extended: false })
let app = express();
/*app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

 */
// For Passport
//app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
//app.use(passport.initialize());
//app.use(passport.session()); // persistent login sessions
app.set("views", "./views");
app.set("view engine", "ejs");

let connection = mysql.createConnection({
    host: '192.168.43.104',
    user: 'anastasia',
    password: 'anastasia',
    database: 'users'
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());                          ////сообщить Express, что мы будем использовать некоторые из его пакетов


connection.connect((err)=>{
    if(err) throw err;
    console.log("Connection ok!");
})

app.get("/", function (req, res) {
    res.render("mainForm" , {});
});
app.get("/authorisation", function (req, res) {
    res.render('authorization', {
        status : false
    });
});
app.get("/enter", function (req, res) {
    res.render('enter', {
        status : false
    });
});

/*
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());
*/

app.post("/regestrationAction", urlencodedParser, (req, res)=>{
    const userName = req.body.userName;
    const userPass = req.body.userPass;
    const userEmail = req.body.userEmail;
    let userPassNew = req.body.userPassNew;
    if(userPass === userPassNew) {
        let queryInser = "INSERT INTO users(userName, userPass, userEmail) VALUES(?,?,?)";
        connection.query(queryInser, [userName, userPass, userEmail], (err, results) => {
            if (err) throw err;
            /* req.flash('success', 'Registration successfully');
             res.locals.message = req.flash();*/   ///////ВЫВЫОД ОБ УСПЕШНОЙ РЕГЕСТРАЦИИ
            res.redirect("/");
            /* res.render('showUsers', {
                  status: true
              })*/
        })
    }
    else {
        res.send("Incorrect password");
    }
});

app.post("/enterUser", urlencodedParser, function (req, res){
    const userName = req.body.userName;
    const userPass = req.body.userPass;
    if(userName && userPass){
        connection.query("SELECT * FROM users WHERE userName = ? AND userPass = ?", [userName, userPass ], function (err, results, fields) {
            if(results.length > 0){
                //req.session.loggedin = true;
                req.session.userName = userName;
                res.redirect("/showUsers");
            }
            else{
                res.send('Incorrect Username and/or Password!');
        }
            res.end();
        });
}else {
        res.send('Please enter Username and Password!');
        res.end();
    }

});

app.get("/showUsers", function (req, res) {
    let querySel = "SELECT * FROM users";
    connection.query(querySel, (err, results)=>{
        if(err) throw err;
        res.render("showUsers", {
            usersList: results
        });
    });
});





app.listen(3000, () => {
    console.log("Server started!!!");
})