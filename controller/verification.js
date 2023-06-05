const crypto = require('crypto');

// Generate a verification token
function generateVerificationToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  //create password
  function generateRandomPassword(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  
    return password;
  }
  
  const passwordLength = 10; // Set the desired length of the password
  
  const randomPassword = generateRandomPassword(passwordLength);

  
module.exports ={generateVerificationToken,randomPassword};   
