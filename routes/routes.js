const db =require('../controller/dbconnect');
const mail =require("../controller/mailserv");
const verify =require("../controller/verification");
const path=require('path');

var routes =function(app,isAuth,encoder){     

   //aswassdssd
   
   
    app.get('/', (req, res) => {
        res.render('index');
        
      });
      app.get('/home', (req, res) => {
        res.render('index');
          
      });
      app.get('/welcome', (req, res) => {
        res.render('welcome');
        
      });
      app.get('/inner-page', (req, res) => {
        var id=req.query.id; 
        console.log(id);
        if(id ==='1010')
           res.render('inner-page',{message:'registeration complete!!'});
        else if(id ==='8989')
           res.render('inner-page',{message:'logged out successfully!!'});
        else
            res.render('inner-page');
      });
     
      app.get('/addnew',isAuth,(req, res) => {
        res.render('addnew');
      });
     
      app.get('/Principal',isAuth,(req, res) => {
        res.render('Principal');  
      });

      //forms
      app.get('/tform',isAuth,(req, res) => {
 
        res.render('tform',{user:req.query.user});  
      }); 
      app.get('/sform/:name',isAuth,(req, res) => {
        res.render('sform');  
      }); 
      app.get('/cform/:name', (req, res) => {
        res.render('cform');
      });
      
        
    /*------register forms-------*/   

      //colllge form
      app.post('/cform',encoder,(req, res) => {
        var {collegename,collegeid,university,addresss,mobile,email,website,logo,image,username,password,repassword}=req.body;
          let filePathlogo= "./public/uploads/college/"+Date.now()+logo.name;
          let filePathimg=  "./public/uploads/college/"+Date.now()+image.name ;
          
          if(!logo) {
              return res.status(400). send('please upload college logo. .');
          }
          if(!image) {
            return res.status(400). send('please upload college image. .');
          }
          console.log(logo);
          logo.mv(filePathlogo,function(err){
              if(err) throw err;
          })
          image.mv(filePathimg,function(err){
            if(err) throw err;
          })
          db.connection.query("INSERT INTO college VALUES (?,?,?,?,?,?,?,?,?,?,?) ",
          [username,password,collegeid,collegename,university,addresss,mobile,email,filePathlogo,filePathimg,website],
          (err,results,fields)=>{
            if(err){
               res.send("server error");
               throw err;
            } 
            else{ 
              res.render('/staffadvisor');
            } 
    
       });  
    });

    //student form
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

          photoPath = photoPath.replace('public', '');
          
          db.connection.query("UPDATE student SET name=?, address=?, phno=?, email=?, yearofadmission=?, regno=?, admno=?, collegeid=?, photo=?, username=?, password=? WHERE regno=?",
            [name, address, phno, email, yearofadmn, regno, admno, collegeid, photoPath, username, password, regno],
            (err, results, fields) => {
              if (err) {
                console.error(err);   
                return res.status(500).send('Server error');
              } else {
                console.log('Query successful');
                return res.redirect(`/inner-page?id=${'1010'}`);
              }
            });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).send('Server error');
        });
    });
    
   //teacher form
 app.post('/tform',(req, res) => {
    var {name,id,address,phno,email,design,dept,collegeid,username,password,repassword}=req.body;
     var{photo,signature}=req.files;
 
     const photoName = `${username}_photo${path.extname(photo.name)}`;
     const signatureName = `${username}_signature${path.extname(signature.name)}`;

     let photoPath = path.join('./public/uploads/teacher', username, photoName);
     let signaturePath = path.join('./public/uploads/teacher', username, signatureName);

      if(password!==repassword){
         return res.status(400).send('passwords do not match');
      }
      if(!photo) {
          return res.status(400). send('please upload photo .');
      }
   
      photo.mv(photoPath,function(err){
          if(err) throw err;
          else { 
            console.log('upload successful');
            photoPath = photoPath.replace('public', '');
          }
        })   
      signature.mv(signaturePath,function(err){
         if(err)
            throw err;
         else { 
          console.log('upload successful');
          signaturePath = signaturePath.replace('public', '');
         }   
      }) 
     db.connection.query("update ?? set name=?,id=?,photo=?,address=?,signature=?,phno=?,email=?,design=?,department=?,collegeid=?,username=?,password=? where id=?"
      ,[req.query.user,name,id,photoPath,address,signaturePath,phno,email,design,dept,collegeid,username,password,id],
      (err,results,fields)=>{  
        if(err){
           res.send("server error");  
           throw err;  
        } 
        else{  
          console.log('query succesful');
          res.redirect(`/inner-page`);
        } 
    });  
 });  

  //principal form

 app.post('/pform/:name',encoder,(req, res) => {
 
    var name =req.body.name;
    var id =req.body.id;
    var photo =req.files.photo;
    var address =req.body.address;
    var signature =req.files.signature;
    var mobile =req.body.phno;
    var email =req.body.email;
    var design =req.body.design;
    var dept =req.body.dept;
    var collegeid =req.body.collegeid;
    var username =req.body.username;
    var password =req.body.password;
    var repassword =req.body.re-password;

   console.log(photo,signature);
   
    let filePathphoto= "./public/uploads/principal/"+Date.now()+photo.name;
    if(password!==repassword)
        res.status(400).send('passwords do not match')
    if(!photo) {
        return res.status(400). send('please upload photo .');
    }
    console.log(logo);
    photo.mv(filePathphoto,function(err){
        if(err) throw err;
    })
    db.connection.query("INSERT INTO student VALUES (?,?,?,?,?,?,?,?,?,?) ",
    [name,id,collegeid,admno,address,mobile,email,filePathphoto,username,password],
    (err,results,fields)=>{
      if(err){
         res.send("server error");
         throw err;
      } 
      else{ 
        res.render(`/Principal/${req.params.name}`);
      }   
      });  
   });  


    /*------dashboards-------*/   

    //staffadvisor
    app.get('/staffadvisor/:name',isAuth,(req, res) => {
       
      if(req.session.user){
        try {
          const query1 = new Promise((resolve, reject) => {
            db.connection.query("select * from requests", (err, results, fields) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            }); 
          });
        
          const query2 = new Promise((resolve, reject) => {
            db.connection.query("select name,id,phno,department,address,email,photo from tutor where username=?",[req.params.name],(err,results,fields)=>{
            if(err) {
                        reject(err);      
              }
              else{
                console.log(results);
                const { name, id, phno, department, address, email, photo } = results[0];
                const data = { Name: name, Id: id, Phno: phno, Dept: department, Addr: address, Email: email, Photo: photo };
                resolve(data);
                
              }
            }); 

          });
          Promise.all([query1, query2])
          .then(([requests, tutorData]) => {
            console.log(tutorData.Photo);
            res.render('Staffadvisor', { tutorData, applications: requests });
          })
          .catch((err) => {
            console.log(err);
            res.send('server error');
          });
        }catch(err){
            console.log(err);
        }
      }else{
        res.send('unauthorized user');
      }
 
    });
    
    //hod
    app.get('/hod/:name',isAuth,(req, res) => {
       
      if(req.session.user){
        try {
          const query1 = new Promise((resolve, reject) => {
            db.connection.query("select * from requests", (err, results, fields) => {
              if (err) {
                reject(err);
              } else {
                resolve(results);
              }
            }); 
          });
        
          const query2 = new Promise((resolve, reject) => {
            db.connection.query("select name,id,phno,department,address,email,photo from tutor where username=?",[req.params.name],(err,results,fields)=>{
            if(err) {
                        reject(err);      
              }
              else{
                console.log(results);
                const { name, id, phno, department, address, email, photo } = results[0];
                const data = { Name: name, Id: id, Phno: phno, Dept: department, Addr: address, Email: email, Photo: photo };
                resolve(data);
                
              }
            }); 

          });
          Promise.all([query1, query2])
          .then(([requests, tutorData]) => {
            console.log(tutorData.Photo);
            res.render('Staffadvisor', { tutorData, applications: requests });
          })
          .catch((err) => {
            console.log(err);
            res.send('server error');
          });
        }catch(err){
            console.log(err);
        }
      }else{
        res.send('unauthorized user');
      }
 
    });
    //Principal
    app.get('/Principal/:name',isAuth,(req, res) => {
      console.log(req.params.name);
      if(req.session.user){
        try{
          db.connection.query("select * from principal where username=?",
          [req.params.name],(err,results,fields)=>{
           if(err) {
             throw err;
             
           }
           else{
              console.log(results);
              var Name=results[0].name;
              var Id=results[0].id;
              var Mobile=results[0].phno;  
              var Address=results[0].address
              var Email=results[0].email;
              var Photo=results[0].photo;
              res.render('Principal',{Name,Id,Mobile,Address,Email,Photo})
           }
         }); 
        }catch(err)
        {
            console.log(err);
            res.send('server error');
        }
    
      }
      else{
        res.send('unauthorized user');
      }
    
    }); 

   //Student
    app.get('/student/:name',isAuth,(req, res) => {
      console.log(req.params.name);
      if(req.session.user){
        try{
          db.connection.query("select * from student where username=?",
          [req.params.name],(err,results,fields)=>{
           if(err) {
             throw err;
             
           }
           else{
              console.log(results);
              var name=results[0].name;
              var admno=results[0].admno;
              var regno=results[0].regno; 
              var dept=results[0].department;
              var phno=results[0].phno;  
              var addr=results[0].address
              var email=results[0].email;
              var photo=results[0].photo;
              res.render('student',{name,admno,regno,dept,phno,addr,email,photo})
           }
         }); 
        }catch(err)
        {
            console.log(err);
            res.send('server error');  
        }
    
      }
      else{
        res.send('unauthorized user');
      }
     
    });
    
    //Office

     app.get('/college/:name',isAuth,(req, res) => {
      console.log(req.params.name);
      if(req.session.user){
        try{
          db.connection.query("select * from principal where username=?",
          [req.params.name],(err,results,fields)=>{
           if(err) {
             throw err;
             
           }
           else{
              console.log(results);
              var Name=results[0].collegename;
              var Id=results[0].collegeid;  
              var Email=results[0].email;
              var Website=results[0].webiste;
              var Address=results[0].address;
              var Mobile=results[0].phno;  
              var Photo=results[0].collegeimage;
              res.render('Principal',{Name,Id,Mobile,Website,Address,Email,Photo})
           }
         }); 
        }catch(err)
        {
            console.log(err);
            res.send('server error');
        }
    
      }
      else{
        res.send('unauthorized user');
      }
    
    }); 
    

     /*-----add user pages-----*/

     //tutor
      app.get('/tutoradd',(req,res)=>{     
          
      db.connection.query("select * from Tutor",
          [req.body.name],(err,results,fields)=>{
           if(err) {
             throw err;
             
           }
           else{
              res.render('addnewtutor',{applications:results});
           }
         }); 
         
     });
  
     app.post('/tutoradd',encoder,(req,res)=>{
         var hodid=req.params.id;
          var {name,id,batch,email}=req.body;
          let Collegeid='1';
          async function getid() {
            try {
              let Collegeid = '12345';
          
              const hodQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("SELECT collegeid FROM hod WHERE id=?", [hodid], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                  }
                });
              });
          
              Collegeid = hodQueryResult[0].collegeid;
              console.log(Collegeid); // Output the updated Collegeid value here
          
              const studentsQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("insert into tutor (name,id,collegeid,email,batch) values(?,?,?,?,?)", [name,id,Collegeid,email,batch], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                    res.redirect('/tutoradd');
                  };
                });
              });
          
            } catch (error) {
              res.send('server error');
              throw error;
            }
          }
        getid();  
     });
     
    
     //add new HOD
  
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
    
        var {name,id,dept,email}=req.body;
        let Collegeid='1';    
        async function getData() {
          try {
            let Collegeid = '12345';
        
            const hodQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("SELECT collegeid FROM college WHERE id=?", [Collegeid], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            });
        
            Collegeid = hodQueryResult[0].collegeid;
            console.log(Collegeid); // Output the updated Collegeid value here
        
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


 
      //student add  
          app.get('/studentadd',(req,res)=>{
                  
            db.connection.query("select * from Student",
                [req.body.name],(err,results,fields)=>{
                if(err) {
                  throw err;
                  
                }
                else{
                   console.log(results);
                    res.render('addnewstudent',{applications:results});
                }
              }); 
              
          });
   
      app.post('/studentadd',encoder,(req,res)=>{
        var tutorid=req.params.id;
        var {name,id,email}=req.body;
        async function getData() {
          try {
            let Collegeid;
            const hodQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("SELECT collegeid FROM tutor WHERE id=?", [tutorid], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            });
        
            Collegeid = hodQueryResult[0].collegeid;
            console.log(Collegeid); // Output the updated Collegeid value here
        
            const studentsQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("insert into student (name,regno,collegeid,email) values(?,?,?,?)", [name,id,Collegeid,email], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                  res.redirect('/studentadd');
                };
              });
            });
        
          } catch (error) {
            res.send('server error');
            throw error;
          }
        }
        getData()   
    });

    //principal add
        app.get('/principaladd',(req,res)=>{
                
          db.connection.query("select * from  principal",
              [req.body.name],(err,results,fields)=>{
              if(err) {
                throw err;
                
              }
              else{
                  res.render('addnewprincipal',{applications:results});
              }
            }); 
            
        });
        
        app.post('/principaladd',encoder,(req,res)=>{

          var {name,id,email}=req.body;
          
          async function getData() {  
            try {
              let Collegeid='98765432';      
              const studentsQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("insert into principal (name,id,collegeid,email) values(?,?,?,?)", [name,id,Collegeid,email], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                    res.redirect('/principaladd');
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
   
      /*-----------REQUEST HANDLING ROUTES ------*/

   //STATUS ROUTE FOR STUDENTS 
  app.get('/status',(req,res)=>{         
         
          var results=[];
          res.render('status',{applications:results});
      });
      
      
  // SENDING REQUEST ROUTE FOR STUDENTS 
  app.get('/requests',(req,res)=>{         
         
      var results=[];
      res.render('requests',{applications:results});
   });
         
   // SENDING REQUEST ROUTE FOR STUDENTS 
   app.get('/verified-requests',(req,res)=>{         
         
    var results=[];
    res.render('verified_requests',{applications:results});
   });
     
   // PENDING REQUEST ROUTE FOR ADMINS 
   app.get('/pending-requests',(req,res)=>{         
         
      var results=[];
      res.render('pending-requests',{applications:results});
    });


/*----------- FORM CONTROL AND MAANGEMENT -------------*/

   // ADDING TEMPLATE 
   app.get('/addtemplate',(req,res)=>{         
         
    var results=[];
    res.render('addtemplate',{applications:results});
  });

 


/*----------- other control routes -------------*/

      // Set up a route for the login page
   app.post('/inner-page',encoder,(req, res,next) => {
            var user =req.body.users; 
            var username =req.body.username;
            var password =req.body.password;
            
            console.log(req.body);
 

            db.connection.query("select username,password,phno from ?? where username=? and password=?",[user,username,password],(err,results,fields)=>{
            if(err) {
              res.send('server error');
              throw err;
              
            } 

            if(results.length>0){
                req.session.isAuth=true;  
                req.session.user =username;
                console.log(req.session.id);
                switch(user) {
          
                  case 'Student':   
                                      try{ 

                                        if(results[0].phno===null){
                                            res.redirect(`/sform/${username}`);
    
                                        }
                                        else{ 
 
                                              res.redirect(`/student/${username}`);
                                        }
                                    
                                        }catch{
                                          console.log(err);
                                          res.send('server error');
                                        }
                              break;

                  case 'Tutor':
                                  try{   

                                          if(results[0].phno===null){
                                              res.redirect(`/tform/${username}`);
                                          }
                                          else{
                                                res.redirect(`/staffadvisor?username=${username}&user='tutor`);
                                          }
                                      
                                    }catch{
                                      console.error(err);
                                      res.send('server error');
                                    }
                    
                        break;
                  case 'Hod':
                              try{
                                      if(results[0].phno===null){
                                          res.redirect(`/tform?username=${username}&user=${user}`);
                                      }
                                      else{
                                            res.redirect(`/hod/${username}`);
                                      }
                  
                                }catch{
                                  console.log(err);
                                  res.send('server error');
                                }

                        break;
                  case  'Principal':
                                    try{
                                            if(results[0].phno===null){
                                                res.redirect(`/pform/${username}`);
                                             }
                                            else{
                                                  res.redirect(`/Principal/${username}`);
                                            }
                              
                                      }catch{
                                        console.log(err);
                                        res.send('server error');
                                      }
                      
                                            break;
                  case  'Office':
                                  try{
                                          if(results[0].phno===null){
                                              res.redirect(`/cform/${username}`);
                                              console.log('hello');
                                          }
                                          else{
                                                res.redirect(`/staffadvisor/${username}`);
                                          }
                            
                                    }catch{
                                      console.log(err);
                                      res.send('server error');
                                    }

                        break;  
              }
              }
              else{  
                res.render('inner-page',{message:'incorrect username or password'}); 
              } 
              res.end();
              
            })
            
          });
      
      //delete user
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
  
     //logout
      app.get('/logout',(req,res)=>{
        req.session.destroy(function(err){  
          if(err){
            console.log(err);
            res.send('error');
          }else{
            res.redirect('/inner-page?id=8989');
          }
        })
      });
    
      /* app.get('/verify',(req,res)=>{ 
          
      var token = verify.generateVerificationToken();
           
        db.connection.query("select email,token from verification where user=? and email=?",[user,email],(err,results,fields)=>{
          if(err) {
            res.send('server error');
            throw err;
                 
          }
          else{
            var vertoken =results[0].token;
            if(vertoken==token){
                   res.render('email-verified');
            }
            else{
               res.send('email not verified');
            }
          }
         });
      })
    */
}  

module.exports = routes;
