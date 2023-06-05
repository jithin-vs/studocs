const express = require('express');
const bodyParser=require('body-parser');
const mail =require("./controller/mailserv");
const verify =require("./controller/verification");
const db =require('./controller/dbconnect');
const fileUpload=require('express-fileupload');
const path=require('path');
const app = express();
app.set('view engine','ejs');  
app.use(express.static('public'));
app.use(express.json({}));
app.use(fileUpload({
  createParentPath:true,
  limits:{
    fileSize:4*1024*1024
  },
  abortOnLimit:true
}
));

const encoder =bodyParser.urlencoded({extended:false});

  app.get('/', (req, res) => { 
    
    res.redirect('/addtemplate'); 
    
  });
    // ADDING TEMPLATE 
     app.get('/addtemplate',(req,res)=>{         
         
      var results=[];
      res.render('addtemplate',{applications:results});
    });

       // ADDING FORM 
       app.get('/addnewform',(req,res)=>{         
         
        var results=[];
        res.render('addnewform',{applications:results});
      });
  app.get('/Principal',(req, res) => {
    console.log(req.params.name);
      /*try{
        db.connection.query("select * from principal where username=?",
        [req.params.name],(err,results,fields)=>{
         if(err) {
           throw err;
           
         } */
            var results=[];
            console.log(results);
            var Name=results[0];
            var Id=results[0];
            var Mobile=results[0];  
            var Address=results[0]
            var Email=results[0];
            var Photo=results[0];
            res.render('Principal',{Name,Id,Mobile,Address,Email,Photo,applications:results});

  });
  app.get('/hod',(req, res) => {
    var results=[];
    console.log(results);
    var Name=results[0];
    var Id=results[0];
    var Mobile=results[0];  
    var Addr=results[0]
    var Email=results[0];
    var Photo=results[0];
    var Dept=results[0];
    res.render('hod',{Name,Id,Mobile,Addr,Email,Dept,Photo,applications:results})

  });
 
  
  
  //studetn form 
  app.post('/sform', encoder, (req, res) => {
    console.log(req.body);
    var { name, address, phno, email, yearofadmn, regno, admno, collegeid, username, password, repassword } = req.body;
    var { photo } = req.files;
    console.log(yearofadmn);
    console.log(collegeid);
    const photoName = `${username}_photo${path.extname(photo.name)}`;
   
    let photoPath = path.join('./public/uploads/student', username, photoName);
  
    if (password !== repassword) {
      return res.status(400).send('Passwords do not match');
    }
    if (!photo) {
      return res.status(400).send('Please upload a photo.');
    }
   
    photo.mv(photoPath)
      .then(() => {
        console.log('Upload successful');
        photoPath = photoPath.replace('public','');
        console.log(photoPath); // Output: images/photo.jpg

        /*db.connection.query("UPDATE student SET name=?, address=?, phno=?, email=?, yearofadmission=?, regno=?, admno=?, collegeid=?, photo=?, username=?, password=? WHERE regno=?",
          [name, address, phno, email, yearofadmn, regno, admno, collegeid, photoPath, username, password, regno],
          (err, results, fields) => {
            if (err) {
              console.error(err);   
              return res.status(500).send('Server error');
            } else {
              console.log('Query successful');
              return res.redirect(`/inner-page?id=${'1010'}`);
            }
          }); */
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).send('Server error');
      });
  });
  
  app.get('/hodadd',(req,res)=>{
            
    db.connection.query("select * from hod",
        [req.body.name],(err,results,fields)=>{
         if(err) {
           throw err;
           
         }
         else{
            res.render('addnewhod',{applications:results});
         }
       }); 
       
   });
   
    app.post('/hodadd',encoder,(req,res)=>{
      
      console.log(req.body);
      var {name,id,dept,email}=req.body;
      let Collegeid='1';    
      async function getData() {
        try {
          let Collegeid = '98765432';
 // Output the updated Collegeid value here
      
          const studentsQueryResult = await new Promise((resolve, reject) => {
            db.connection.query("insert into hod (name,id,collegeid,email,department) values(?,?,?,?,?)", [name,id,Collegeid,email,dept], (err, results, fields) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
                res.redirect('/hodadd');
              };
            });
          });
      
        } catch (error) {
          res.send('server error');
          throw error;
        }
      }
    getData();
   });


/*    app.post('/addnew',encoder,(req,res) =>{  
      console.log(req.body);  
      var {name,id,email}=req.body;
      const genPassword=verify.randomPassword;
      mail.sendcredEmail(name,email,email,genPassword);  
        db.connection.query(" insert into Principal values(?,?,?)",[id,email,token],(err,results,fields)=>{
        if(err) { 
          res.send('server error');
          throw err;       
        }
        else
        console.log('query succesful');
      }); 
    
      });  
    /* -------- other control routes */   
    app.post('/deleteuser/:id',encoder,(req,res)=>{ 
      console.log(req.params.id);     
      db.connection.query("delete from ?? where id=?",[req.params.user,req.params.id],(err,results,fields)=>{
        if(err) {
          res.send('server error');
          throw err;
              
        }
        else{
           res.redirect('/tutoradd');
        }
      }); 
     })

    app.get('/verify',(req,res)=>{ 
        
        const Token =req.query.token;
        const Email =req.query.email;
        console.log(req.query);

        db.connection.query("select token from verification where email=?",[Email],(err,results,fields)=>{
          if(err) {
            res.send('server error');
            throw err;
                
          }
          else{

            var vertoken =results[0].token;
            if(vertoken==Token){
                  res.render('email-verified');
            }
            else{
                res.send('email not verified');
            }
          }
        });
      })
  
  app.listen(5000, () => {  
      
    console.log('Studocs app is listening on port 5000.');
  });   
