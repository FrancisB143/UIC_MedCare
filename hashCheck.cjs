const bcrypt = require('bcrypt');

const plainPassword = "123"; // replace with the password you typed during login
const hash = "$2b$10$r0mJ0hE14ANtVEfOqKLKXOohhIphAsSfHUiu2FCPcdk8Pumkh6e0i";

bcrypt.compare(plainPassword, hash).then(match => {
  console.log("Match:", match); // should print true if it matches
});
