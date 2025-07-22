const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "meditrack_db"
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Received login:", email, password);

  const sql = "SELECT * FROM `users` WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ status: "error", message: "Database error" });
    }

    if (results.length === 0) {
      console.log("User not found");
      return res.status(404).json({ status: "fail", message: "No user found" });
    }

    const user = results[0];
    console.log("Found user:", user.email);

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match:", match);

    if (match) {
      return res.status(200).json({ status: "success", message: "Login successful" });
    } else {
      return res.status(401).json({ status: "fail", message: "Incorrect password" });
    }
  });
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});