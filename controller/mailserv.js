const nodemailer = require("nodemailer");
require('dotenv').config();

let transporter=nodemailer.createTransport({
  host:'smtp.gmail.com',
 port:587,
 secure:false,
 requireTLS:true,
 tls: {
  rejectUnauthorized: false
 },
 auth:{
   user:'studocs.geci@gmail.com',
   pass:process.env.EMAIL_PASS
 }
});
const sendverifyEmail=async(name,email,token)=>{

      const mailOptions = {
        from: 'studocs.geci@gmail.com',
        to: email,
        subject: 'Verify your email address',
        html: '<p>Hi '+name+' please  <a href="http://127.0.0.1:3000/verify?token='+token+'&?email='+email+'">click here</a> to verify your email.</p>'
         
      };  
      transporter.sendMail(mailOptions, function(error,info){
        if(error){
           console.log(error);
        }
        else{
           console.log("Email has been sent:- ",info.response);
        }
      })

    
}

const sendcredEmail=async(name,email,gen_username,gen_password)=>{
      console.log('sending mail....');
      const mailOptions = {
        from: 'studocs.geci@gmail.com',
        to: email,
        subject: 'Login details',
        html: '<p>Hi, '+name+' .Given below is your username and password .You can change your login details if needed</p>  <p>Username: '+gen_username+'</p> <p>Password: '+gen_password+'</p>'   
      };
      transporter.sendMail(mailOptions, function(error,info){
        if(error){
           console.log(error);
        }
        else{

           console.log("Email has been sent:- ",info.response);
        }
      })

}
 
/*const verifyEmail =async (req,res) =>{
   
  try{
   //
  } catch(error) {
      console.log(error.message);
  }
} */

 module.exports = {sendverifyEmail,sendcredEmail};
