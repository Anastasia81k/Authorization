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
    res.render("mainForm" , {
        status: false
    });
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
app.get("/showProfile", function (req, res) {
    res.render('showProfile', {
        status : false
    });
});
app.get("/addCadet", function (req, res) {
    res.render('addCadet', {
        status : false
    });
});
/*
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(flash());
*/


app.post("/addCadet", urlencodedParser, (req, res)=>{
    const cadetRank = req.body.cadetRank;
    const cadetLastName = req.body.cadetLastName;
    const cadetName = req.body.cadetName;
    const cadetPatronymic = req.body.cadetPatronymic;
    const cadetBirthday = req.body.cadetBirthday;
    const cadetMStatus = req.body.cadetMStatus;
    let queryInsCadet = "INSERT INTO cadet (cadetRank, cadetLastName, cadetName, cadetPatronymic, cadetBirthday, cadetMStatus) VALUES(?,?,?,?,?,?);";
    connection.query(queryInsCadet, [cadetRank,cadetLastName,cadetName,cadetPatronymic, cadetBirthday,cadetMStatus], (err, results)=>{
        if(err) throw err;
        res.redirect('/showCadets');
    })
})

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
            /*res.render("showProfile",{
                status : true
            });*/
          // res.redirect("/");
            res.render('mainForm',{
                status: true
            })
        })
    }
    else {
        res.send("Incorrect password");
    }
});

app.post("/enterUser", urlencodedParser, function (req, res){
    const userName = req.body.userName;
    const userPass = req.body.userPass;
    const userId = req.params.userId;
    if(userName && userPass){
        connection.query("SELECT * FROM users WHERE userName = ? AND userPass = ? AND userId", [userName, userPass, userId], function (err, results, fields) {
            if(results.length > 0){
                //req.session.loggedin = true;
                req.session.userName = userName;
                res.render("showProfile", {
                    usersList: results,
                    status: true
                })
              /*res.render("showUsers", {
                  usersList: results,
                  status : true
              })*/
              //res.redirect("/showUsers");
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

app.get("/showCadets/delete/:id", (req, res)=>{
    const id = req.params.id;
    let queryDelCadet = "DELETE FROM cadet WHERE cadetId =?;";
    connection.query(queryDelCadet, [id], function (err, data) {
        if(err) throw err;
        /*res.render("showCadets", {
            status : true
        })*/
        res.redirect("/showCadets");
    })
})

app.get("/showCadets/edit/:id", (req, res)=>{
    const id = req.params.id;
    let querySelId ="SELECT cadetId, cadetRank, cadetLastName, cadetName, cadetPatronymic, DATE_FORMAT(cadetBirthday, '%d/%m/%Y') as cadetBirthday, cadetMStatus FROM cadet WHERE cadetId = ?;";
    connection.query(querySelId, [id], function (err, results) {
        if(err) throw  err;
        res.render("editCadet", {
            cadetList: results
        })
    })
})

app.get("/enterUsers/:id", (req,res)=>{
    const id = (req.params.id).slice(1);
    connection.query("SELECT * FROM users WHERE userId = ?", [id],function (err, results) {
        if(err) throw err;
       res.render("editProfile",{
            userList: results,
        });
    });
});


app.get("/showUsers", function (req, res) {
    let querySel = "SELECT * FROM users";
    connection.query(querySel, (err, results)=>{
        if(err) throw err;
        res.render("showUsers", {
            usersList: results,
        });
    });
});

app.get("/showCadets", function (req, res) {
    //let querySelCadet = "SELECT * FROM cadet;";
    let querySelCadet = "SELECT cadetId, cadetRank, cadetLastName, cadetName, cadetPatronymic, DATE_FORMAT(cadetBirthday, '%d/%m/%Y') as cadetBirthday, cadetMStatus from cadet; "
    connection.query(querySelCadet, (err, results)=>{
        if(err) throw err;
        res.render("showCadets", {
            cadetList: results,
            status : false
        });
    });
});

app.post("/editCadet", urlencodedParser, (req, res)=>{
    let cadetRank = req.body.cadetRank;
    let cadetLastName = req.body.cadetLastName;
    let cadetName = req.body.cadetName;
    let cadetPatronymic = req.body.cadetPatronymic;
    let cadetBirthday = req.body.cadetBirthday;
    let cadetMStatus = req.body.cadetMStatus;
    let cadetId = req. body.cadetId;
    let queryUpdateCadet = "UPDATE cadet SET cadetRank =?, cadetLastName =?, cadetName =?, cadetPatronymic=?, cadetBirthday=?, cadetMStatus =?  WHERE cadetId = ? ; ";
    connection.query(queryUpdateCadet, [cadetRank, cadetLastName, cadetName, cadetPatronymic, cadetBirthday, cadetMStatus, cadetId], (err, results)=>{
        if(err) throw  err;
        res.redirect("/showCadets");
    });
});


app.post("/editProfile", urlencodedParser, (req, res)=>{
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    let userEmail = req.body.userEmail;
    let userId = req.body.userId;
    let queryUpdate = "UPDATE users SET userName = ?, userPass = ?, userEmail =?  WHERE userId = ?;";
    connection.query(queryUpdate, [userName, userPass, userEmail, userId], (err, results)=>{
        if(err) throw err;
        res.redirect("/showUsers");
      /* res.render("showUsers"),{
            usersList: results,
            status : false
        };*/
    });
});


app.listen(3000, () => {
    console.log("Server started!!!");
})

