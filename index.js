const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database:'new_app',
  password: 'Adarsh@616'
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
  
}


app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let count = result[0]["count(*)"];
      res.render("home", {count});
    });
  } catch(err){
    console.log(err);
    res.render("some error in db");
  }
});

app.get("/add", (req, res) => {
  res.render("new");
});


// connection.end();

app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try{
    connection.query(q, (err, user) => {
      if(err) throw err;
      res.render("showuser", {user});
    });
  } catch(err){
    console.log(err);
    res.render("some error in db");
  }
});

app.post("/add", (req, res) => {

  let { id, username, email, password } = req.body;

  let q = "INSERT INTO `user` (id, username, email, password) VALUES (?, ?, ?, ?)";

  connection.query(q, [id, username, email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.send("Database error", err.message);
    }

    // After successful insert
    res.redirect("/user");   // ✅ Best practice
  });
});

app.get("/user/:id/edit", (req, res) => {
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      res.render("edit", { user });
    });
  } catch(err){
    console.log(err);
    res.render("some error in db");
  }
  
});

app.delete("/user/:id", (req, res) => {
    let { id } = req.params;
    let q = "DELETE FROM `user` WHERE id = ?";
    connection.query(q, [id], (err) => {
        if (err) return res.send("Delete error");
        res.redirect("/user");
    });
});

app.patch("/user/:id",(req, res) => {
  let {id} = req.params;
  let {password: formPass, username: newUsername} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  try{
    connection.query(q, (err, result) => {
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("Wrong password");
      }else{
        let q2 = `UPDATE user SET username = '${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if(err) throw err;
          res.redirect("/user");
        }) ;
      }
      
    });
  } catch(err){
    console.log(err);
    res.render("some error in db");
  }
});

app.listen("8080", () => {
  console.log("server is listening to 8080");
})

