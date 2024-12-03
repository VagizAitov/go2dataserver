require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "temp",
});

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

app.get("/isAdmin", (req, res) => {
  jwt.verify(req.query.token, process.env.SECRET, (err, dec) => {
    if (err) return res.json(false);
    if (dec.role == "admin") return res.json(true);
    return res.json(false);
  });
});

app.get("/isAuthorized", (req, res) => {
  const token = req.query.token;
  jwt.verify(token, process.env.SECRET, (err, dec) => {
    if (err) return res.json(false);
    const sql = `SELECT * FROM users WHERE id='${dec.id}'`;
    db.query(sql, (err, data) => {
      if (err) return res.json(false);
      if (data.length == 0) {
        return res.json(false);
      }
      return res.json(true);
    });
  });
});
app.get("/form", (req, res) => {
  const sql = `SELECT * FROM forms WHERE id=${req.query.id}`;
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/forms", (req, res) => {
  const sql = "SELECT * FROM forms";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.post("/completedForms", (req, res) => {
  const sql = `INSERT INTO completedforms (id, name, content, id_user) VALUES ('${req.query.id}', '${req.query.name}', '${req.query.content}', '${req.query.id_user}')`;
  console.log(sql);
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
app.get("/idUser", (req, res) => {
  jwt.verify(req.query.token, process.env.SECRET, (err, dec) => {
    return res.json(dec.id);
  });
});
app.post("/createForm", (req, res) => {
  const vals = [req.body.name, JSON.stringify(req.body.questions)];
  db.query(
    "INSERT INTO forms (name, content) VALUES (?)",
    [vals],
    (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    }
  );
});
app.post("/reg", (req, res) => {
  const sql = `INSERT INTO users (name, pass, role) VALUES ('${req.query.name}', '${req.query.pass}', '${req.query.role}')`;
  db.query(sql, (err, data) => {
    if (err) console.log(err);
  });
  db.query("SELECT LAST_INSERT_ID()", (err, data) => {
    if (err) return res.json(err);
    return res.json(
      jwt.sign(
        {
          id: data[0]["LAST_INSERT_ID()"],
          name: req.query.name,
          role: req.query.role,
        },
        process.env.SECRET
      )
    );
  });
});
app.get("/login", (req, res) => {
  const sql = `SELECT * FROM users WHERE name='${req.query.name}' AND pass='${req.query.pass}'`;
  db.query(sql, (err, data) => {
    if (err) res.json(false);
    if (data.length == 0) return res.json(false);
    const token = jwt.sign(
      { id: data[0].id, name: data[0].name, role: data[0].role },
      process.env.SECRET
    );
    return res.json([true, token]);
  });
});
app.listen(PORT, (err) => {
  jwt.verify(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsIm5hbWUiOiJ2YWdpeiIsImlhdCI6MTczMzIyODM3N30.YiEcy4ULL30fMRiw0-Z_yoJ2nuTDSONY8BQxEQBI_gU",
    process.env.SECRET,
    (err, dec) => {
      console.log(dec);
    }
  );
  console.log(PORT, err);
});
