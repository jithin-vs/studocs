const { Console } = require('console');
const db =require('../controller/dbconnect');
const mail =require("../controller/mailserv");
const verify =require("../controller/verification");
const path=require('path');
const { query } = require('express');

var routes =function(app,isAuth,encoder){     
  

   
     
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
        else if(id ==='4000')
           res.render('inner-page',{message:'server error!!'})
        else
            res.render('inner-page');
      });
     
    app.get('/Principal',isAuth,(req, res) => {
        res.render('Principal');  
    });

      //forms
    app.get('/tform',isAuth,(req, res) => {
        var name=req.query.id;
        var user=req.query.user;
        db.connection.query("select collegeid from ?? where id=?",
        [user,name],(err,results,fields)=>{
        if(err) {
          throw err;
          
        }
        else{

          var collegeid=results[0].collegeid;
          console.log(collegeid);
          res.render('tform',{name,collegeid,user}); 
         }
        });
    }); 
    app.get('/sform/:name',isAuth,(req, res) => {

        var name=req.params.name;
        db.connection.query("select * from student where id=?",
        [name],(err,results,fields)=>{
        if(err) {
          throw err;
          
        }
        else{

          var result=results[0];
          console.log(result);
          res.render('sform',{name,result,address}); 
         }
      });    
    }); 
    app.get('/cform/:name', (req, res) => {
        res.render('cform',{name:req.params.name});
    });
    app.get('/pform/:name', (req, res) => {

       var name=req.params.name;
        db.connection.query("select * from principal where id=?",
        [name],(err,results,fields)=>{
        if(err) {
          throw err;
           
        }
        else{ 
 
          var n1=results[0].name;
          var collegeid=results[0].collegeid;
          var address=results[0].address;
          var phno=results[0].phno;
          var email=results[0].email;
          console.log(address);
          res.render('pform',{n1,name,address,phno,email,collegeid}); 
         }
      }); 
    });
      
        
    /*------register forms-------*/   

      //colllge form
    app.post('/cform/:name',(req, res) => {
        console.log(req.body);
        console.log(req.params);
        var name=req.params.name;
        var {collegename,collegeid,university,address,mobile,email,website,logo,image,username,password}=req.body;
        var { logo,image } = req.files;
        console.log(name);
        const photoName = `${name}_photo${path.extname(image.name)}`;
        const logoName = `${name}_logo${path.extname(logo.name)}`;
        console.log(photoName)
        let photoPath = path.join('./public/uploads/college', name, photoName);
        let logoPath = path.join('./public/uploads/college',  name, logoName);
          
          if(!logo) {
              return res.status(400). send('please upload college logo. .');
          }
          if(!image) {
            return res.status(400). send('please upload college image. .');
          }
          console.log(logo);
          image.mv(photoPath,function(err){
            if(err) throw err;
            else { 
              console.log('upload successful');
              photoPath = photoPath.replace('public', '');
            }
          })   
        logo.mv(logoPath,function(err){
           if(err)
              throw err;
           else { 
            console.log('upload successful');
            logoPath = logoPath.replace('public', '');
           }   
        })
          db.connection.query("update college set password=?,collegename=?,university=?,address=?,phno=?,email=?,collegelogo=?,collegeimage=?,website=? where collegeid=?" 
      ,[password,collegename,university,address,mobile,email,logoPath,photoPath,website,name],
      (err,results,fields)=>{  
            if(err){
               res.send("server error");
               throw err;
            }  
            else{ 
              res.redirect('/inner-page');
            } 
    
       });  
    });

    //student form
    app.post('/sform', encoder, (req, res) => {
      console.log(req.body);
      var username=req.query.name;
      var { name, address, phno, email, yearofadmn, regno, admno, password, repassword } = req.body;
      var { photo } = req.files;
      const photoName = `${username}_photo${path.extname(photo.name)}`;
    
      let photoPath = path.join('./public/uploads/student',username, photoName);
      
      photo.mv(photoPath)
        .then(() => {
          console.log('Upload successful');

          photoPath = photoPath.replace('public','');  

          
          db.connection.query("UPDATE student SET name=?, address=?,phno=?, email=?, yearofadmission=?, admno=?, photo=?, password=? WHERE id=?",
            [name, address,phno, email, yearofadmn, admno, photoPath, password,username],
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
    app.post('/tform/:id/:user',(req, res) => {
     var {name,address,phno,email,design,dept,password,repassword}=req.body;
     var{photo,signature}=req.files;
     console.log(req.body);
     var username=req.params.id;
     const photoName = `${username}_photo${path.extname(photo.name)}`;
     const signatureName = `${username}_signature${path.extname(signature.name)}`;

     let photoPath = path.join('./public/uploads/teacher', username, photoName);
     let signaturePath = path.join('./public/uploads/teacher', username, signatureName);
    
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
     db.connection.query("update ?? set name=?,photo=?,address=?,signature=?,phno=?,email=?,department=?,password=? where id=?"
      ,[req.params.user,name,photoPath,address,signaturePath,phno,email,dept,password,username],
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
  console.log(req.body);
  var id=req.params.name;
  var {name,photo,address,signature,phno,email,password}=req.body;
  var { photo,signature} = req.files;
  const photoName = `${id}_photo${path.extname(photo.name)}`;
  const signatureName = `${id}_logo${path.extname(signature.name)}`;
 
  let photoPath = path.join('./public/uploads/college', id, photoName);
  let signaturePath = path.join('./public/uploads/college', id, signatureName);
    
   photo.mv(photoPath,function(err){  
      if(err) throw err;
      else { 
        console.log('upload successful');
        photoPath = photoPath.replace('public','');
      }
    })   
  signature.mv(signaturePath,function(err){
     if(err)
        throw err;
     else { 
      console.log('upload successful');
      signaturePath = signaturePath.replace('public','');
     }    
  })
  db.connection.query("update principal set name=?,address=?,phno=?,email=?,password=?,photo=? where id=?"
,[name,address,phno,email,password,photoPath,id],
(err,results,fields)=>{  
      if(err){
         res.send("server error");
         throw err;
      }  
      else{ 
        res.redirect('/inner-page?id=1010');  
      } 

 });  
    }); 


    /*------dashboards-------*/   

    //staffadvisor
    app.get('/staffadvisor/:name',isAuth,(req, res) => {
       
      if(req.session.user){
        const username = req.params.name;
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
            db.connection.query("SELECT name, id, phno, department, address, email, photo FROM tutor WHERE id = ?", [username], (err, results, fields) => {
              if (err) {
                reject(err);
              } else {
                if (results.length === 0) {
                  reject(new Error('No data found for the specified username.'));
                } else {
                  resolve(results[0]);
                }
              }
            });
          });
    
          Promise.all([query1, query2])
            .then(([requests, tutorData]) => {
              const imagePath = tutorData.photo ? path.relative('public', tutorData.photo) : 'default/path/to/image.jpg';
              const Photo = imagePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URL compatibility
    
              const applications = [];
              res.render('staffadvisor', { Photo, tutorData, applications });
            })
            .catch((err) => {
              console.log(err);
              res.send('Server error: ' + err.message);
            });
        } catch (err) {
          console.log(err);
          res.send('Server error: ' + err.message);
        }
      } else {
        res.send('Unauthorized user');
      }
    });
//hod

app.get('/hod/:name', isAuth, (req, res) => {
  if (req.session.user) {
    try {
      const username = req.params.name;
      
      const query1 = new Promise((resolve, reject) => {
        db.connection.query("SELECT * FROM requests", (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      const query2 = new Promise((resolve, reject) => {
        db.connection.query("SELECT name, id, phno, department, address, email, photo FROM hod WHERE id = ?", [username], (err, results, fields) => {
          if (err) {
            reject(err);
          } else {
            if (results.length === 0) {
              reject(new Error('No data found for the specified username.'));
            } else {
              resolve(results[0]);
            }
          }
        });
      });

      Promise.all([query1, query2])
        .then(([requests, tutorData]) => {
          const imagePath = tutorData.photo ? path.relative('public', tutorData.photo) : 'default/path/to/image.jpg';
          const Photo = imagePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes for URL compatibility

          const applications = [];
          res.render('hod', { Photo, tutorData, applications });
        })
        .catch((err) => {
          console.log(err);
          res.send('Server error: ' + err.message);
        });
    } catch (err) {
      console.log(err);
      res.send('Server error: ' + err.message);
    }
  } else {
    res.send('Unauthorized user');
  }
});

    //hod
 
    //Principal
    app.get('/Principal/:name',isAuth,(req, res) => {
      console.log(req.params.name);
      if(req.session.user){  
        try{
          db.connection.query("select * from principal where id=?",
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
              var imagePath=results[0].photo;
              const Photo = path.relative('public',imagePath);
              applications=[];
              res.render('Principal',{Name,Id,Mobile,Address,Email,Photo,applications})
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
          db.connection.query("select * from student where id=?",
          [req.params.name],(err,results,fields)=>{
           if(err) {
             throw err;
             
           }
           else{
              console.log(results);
              var name=results[0].name;
              var admno=results[0].admno;
              var regno=results[0].id; 
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
            var username=req.params.name;
            console.log(username);
            db.connection.query("select * from college where collegeid=?",[username],(err,results,fields)=>{
            if(err) {
                        reject(err);      
              }
              else{     
                console.log(results);
                const { collegename, collegeid, phno, address, email, collegeimage,website } = results[0];

                var data = { Name: collegename, Id: collegeid, Phno: phno, Addr: address, Email: email, Photo: collegeimage, Website:website};
                const imagePath = path.relative('public', data.Photo);
                // Check and handle the undefined values
                  const name1 = data.Name || 'N/A';
                  const id1 = data.Id || 'N/A';   
                  const phno1 = data.Phno || 'N/A';
                  const addr1 = data.Addr || 'N/A';  
                  const email1 = data.Email || 'N/A';
                  const photo1 = imagePath|| 'N/A';
                  const website1 = data.Website || 'N/A';

                  // Now you can use these variables in your code
                  console.log(name1); 
                  console.log(id1);
                  console.log(phno1);
                  console.log(addr1);
                  console.log(email1);
                  console.log(photo1);
                  console.log(website1);
                   data = { Name: name1, Id: id1, Phno: phno1, Addr: addr1, Email: email1, Photo: photo1, Website:website1};

                resolve(data);
                
              }
            }); 

          });
          Promise.all([query1, query2])
          .then(([requests, collegeData]) => {
            //console.log(tutorData.Photo);
            console.log(collegeData);
            res.render('college', { applications:requests,collegeData });
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
    
  
     /*-----add user pages-----*/

     //tutor
      app.get('/tutoradd',(req,res)=>{     
          
        db.connection.query("select * from tutor ",
        [req.body.name],(err,results,fields)=>{
        if(err) {
          throw err;
          
        }
        else{
           console.log(results);
           var id=req.query.id;
           if(id === null) 
                    id='12345'
           console.log(id);
            res.render('addnewtutor',{applications:results,id});
        } 
      });
         
     });
  
     app.post('/tutoradd',encoder,(req,res)=>{
         var hodid=req.query.id;
          var {name,id,batch,email}=req.body;
          var Collegeid;
          console.log(hodid);
          async function getid() {
            try {
             
              const hodQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("SELECT collegeid,department FROM hod WHERE id=?", [hodid], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else { 

                    //console.log(results);
                    resolve(results);  
                  }   
                });
              });

              Collegeid = hodQueryResult[0].collegeid;
              var department=hodQueryResult[0].department;
              //console.log(Collegeid); // Output the updated Collegeid value here
              const studentsQueryResult = await new Promise((resolve, reject) => {
                var genPassword=verify.randomPassword;
                mail.sendcredEmail(name,email,id,genPassword);  
                db.connection.query("insert into tutor (name,id,collegeid,email,department,batch,password) values(?,?,?,?,?,?,?)", [name,id,Collegeid,email,department,batch,genPassword], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                    res.redirect(`/tutoradd?id=${hodid}`);
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
              res.render('addnewhod',{applications:results,id:req.query.id});
           }
         }); 
         
     });
     
     app.post('/hodadd',encoder,(req,res)=>{ 
        
        var principalid=req.query.id;
        var {name,id,dept,email}=req.body;   
        async function getData() {
          try {
            
            const hodQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("SELECT collegeid FROM principal WHERE id=?", [principalid], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            });
        
            Collegeid = hodQueryResult[0].collegeid;
            console.log(Collegeid); // Output the updated Collegeid value here
            var genPassword=verify.randomPassword;
            mail.sendcredEmail(name,email,id,genPassword);
            const studentsQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("insert into hod (name,id,collegeid,email,department,password) values(?,?,?,?,?,?)", [name,id,Collegeid,email,dept,genPassword], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                  res.redirect(`/hodadd?id=${principalid}`);
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
                   var id=req.query.id;
                   if(id === null)
                            id='12345'
                   console.log(id);
                    res.render('addnewstudent',{applications:results,id});
                } 
              }); 
              
          });
   
         app.post('/studentadd',encoder,(req,res)=>{
        var tutorid=req.query.id;
        var {name,id,email}=req.body;
        var Collegeid;
        async function getData() {
          try {
            const hodQueryResult = await new Promise((resolve, reject) => {
              db.connection.query("SELECT collegeid FROM tutor WHERE id=?", [tutorid], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(results);
                  resolve(results);  
                }
              }); 
            });
        
            Collegeid = hodQueryResult[0].collegeid;
            console.log(Collegeid); // Output the updated Collegeid value here
            var genPassword=verify.randomPassword;
            mail.sendcredEmail(name,email,id,genPassword);
            const studentsQueryResult = await new Promise((resolve, reject) => {  
              db.connection.query("insert into student (name,id,collegeid,email,password) values(?,?,?,?,?)", [name,id,Collegeid,email,genPassword], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                  res.redirect(`/studentadd?id=${tutorid}`);
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
              var genPassword=verify.randomPassword;
              mail.sendcredEmail(name,email,id,genPassword)  
              const studentsQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("insert into principal (name,id,collegeid,email,password) values(?,?,?,?,?)", [name,id,Collegeid,email,genPassword], (err, results, fields) => {
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
      
  // SENDING REQUEST ROUTE FOR STUDENTS    
  app.get('/requests', (req, res) => {
    try {
      db.connection.query("SELECT * FROM forms", (err, results, fields) => {
        if (err) {
          throw err;
        } else {
          res.render('requests', { forms: results,id1:null});
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
         
   // SENDING REQUEST ROUTE FOR STUDENTS 
   app.get('/verified-requests',(req,res)=>{         
         
    var results=[];
    res.render('verified_requests',{applications:results});
   });
     
   // PENDING REQUEST ROUTE FOR ADMINS 
   app.get('/pending-requests/:name',(req,res)=>{         
         
    try{
      db.connection.query("select formdata from forms where name=?",
    [req.params.name],(err,results,fields)=>{
    if(err) {
      throw err; 
    } 
    else{
      const divContent = results[0].formdata;
      console.log(divContent);
      const applications = []; // Empty array, can be populated later if needed
      res.render('pending-requests',{ divContent, applications });
    }
    });
    }catch(err){
      console.log(err); 
    }

    });


/*----------- FORM CONTROL AND MAANGEMENT -------------*/

      // ADDING TEMPLATE 
      app.get('/addtemplate',(req,res)=>{         
        try{
          db.connection.query("select * from forms",
        [req.params.name],(err,results,fields)=>{
        if(err) {
          throw err; 
        } 
        else{
          const divContent = results[0].name;
          const applications = results[0].name;// Empty array, can be populated later if needed
          res.render('addtemplate',{applications:results});
        }
        });
        }catch(err){
          console.log(err); 
        } 
      });
      
      app.get('/get-templates', (req, res) => {
        
        try{
          db.connection.query("select * from forms",
        [req.params.name],(err,results,fields)=>{
        if(err) {
          throw err; 
        } 
        else{
          const templateNames = results.map(result => result.name);
          res.json({ templates: templateNames });
      
        }
        });
        }catch(err){
          console.log(err); 
        } 
        
      });
      
      //STATUS DISPLAY
      app.get('/status/:name',(req,res)=>{
        try{
          db.connection.query("select formdata from forms",
        [req.params.name],(err,results,fields)=>{
        if(err) {
          throw err; 
        } 
        else{
          const divContent = results[0].formdata;
          const applications = []; // Empty array, can be populated later if needed
          res.render('status',{ divContent, applications });
        }
        });
        }catch(err){
          console.log(err); 
        }

    })

    //REQUEST DISPLAY
    app.get('/form/:formId', (req, res) => {
      const formId = req.params.formId;
    
      db.connection.query("SELECT formdata FROM forms WHERE formid = ?", [formId], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error retrieving HTML content');
        } else {
          if (results.length > 0) {
            const fetchedHTML = results[0].formdata;
            console.log('here');
            res.send(fetchedHTML);
          } else {
            res.status(404).send('HTML content not found');
          }
        }
      });
    });
    
    

     //SAVING TEMPLATE
     app.post('/save-template',(req,res)=>{   
      var name=req.query.name; 
      //console.log(name);
      var collegeid='98765432';
      var divContent = req.body.content; 
     //  console.log(divContent);
       db.connection.query("insert into forms(name,collegeid,formdata)values(?,?,?)",
         [name,collegeid,divContent],(err,results,fields)=>{
          if(err) {
            throw err; 
          } else{
             res.redirect('/status');
          }    
       });
       });
     
     //ADD OR EDIT FORMS
     app.get('/addnewform',isAuth,(req, res) => {
      const templateName = req.query.name; // Get the template name from the query parameter
  
      // Fetch the template content from the server
      db.connection.query('SELECT formdata FROM forms WHERE name = ?', [templateName], (err, results, fields) => {
        if (err) {
          throw err;
        } else {
          const templateContent = results.length > 0 ? results[0].formdata : ''; // Get the template content or set it as an empty string if not found
          res.render('addnewform', { templateName: templateName, templateContent: templateContent });
        }
      });;
     });
 
/*----------- other control routes -------------*/

      // Set up a route for the login page
   app.post('/inner-page',encoder,(req, res,next) => {
            var user =req.body.users; 
            var username =req.body.username;
            var password =req.body.password;
            
            if(user === 'Administrator'){
                user='college';
            }
            if(user === 'StaffAdvisor'){
              user='Tutor';
          }
            console.log(req.body);
            if(user === 'college')
               { 
                try{
                    db.connection.query("select collegeid,password,phno from college where collegeid=? and password=?",[username,password],(err,results,fields)=>{
                      if(err) {
                        res.send('server error');
                        throw err;
                        
                      } 
                      if(results.length>0){
                          req.session.isAuth=true;  
                          req.session.user =username;
                          console.log(req.session.id);

                              try{
                                if(results[0].phno===null){
                                    res.redirect(`/cform/${username}`);
                                }
                                else{ 
                                      res.redirect(`/college/${username}`);
                                } 
                  
                                }catch{
                                  console.log(err);
                                  res.send('server error');
                                }
                        }
                        else{  
                          res.render('inner-page',{message:'incorrect username or password'}); 
                        } 
                res.end(); 
                });  
               }catch(err){
                  console.log(err);
                  res.redirect(`/inner-page?id=4000`)
               }
            }
               
          else{
                try{
                  db.connection.query("select id,password,phno from ?? where id=? and password=?",[user,username,password],(err,results,fields)=>{
                  if(err) {
                    console.log(err);
                    return res.redirect(`/inner-page?id=4000`);
                    
                  } 

                  if(results && results.length > 0){ 
                      req.session.isAuth=true;  
                      req.session.user =username;
                      console.log(req.session.id);
                      switch(user) { 
                  
                        case 'Student':    

                                              if(results[0].phno===null){
                                                    return res.redirect(`/sform/${username}`);
          
                                                  
                                              }else{ 
      
                                                   return res.redirect(`/student/${username}`);
                                              }
                                          
                                              
                                    break;

                        case 'Tutor':
                                        try{   

                                                if(results[0].phno===null){
                                                    return  res.redirect(`/tform?id=${username}&user=${user}`);
                                                }
                                                else{
                                                    return  res.redirect(`/staffadvisor/${username}`);
                                                }
                                            
                                          }catch{
                                            console.error(err);
                                            res.send('server error');
                                          }
                          
                              break;
                        case 'Hod':
                                    try{
                                            if(results[0].phno===null){
                                                 return res.redirect(`/tform?id=${username}&user=${user}`);
                                            }
                                            else{
                                                 return res.redirect(`/hod/${username}`);
                                            }
                        
                                      }catch{
                                        console.log(err);
                                        res.send('server error');
                                      }

                              break;
                        case  'Principal':
                                          try{
                                                  if(results[0].phno===null){
                                                      return res.redirect(`/pform/${username}`);
                                                  }
                                                  else{
                                                      return res.redirect(`/Principal/${username}`);
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
                }catch(err){
                 console.log();
                  console.log(err);
                  res.redirect(`/inner-page?id=4000`);
              }
            }
          });

        //REGISTER COLLEGE
        app.post('/register-college',(req,res)=>{
             
           var{name,email}=req.body;
           mail.sendregisterEmail(name,email);
        })   
  
      //delete user
      app.post('/deleteuser',encoder,(req,res)=>{ 
        
        var id =req.query.id;
        var user=req.query.user   
        db.connection.query("delete from ?? where id=?",[req.query.user,req.query.id],(err,results,fields)=>{
          if(err) {
            res.send('server error');
            throw err;  
                
          }
          else{
            if(user ==='student')
               return res.redirect(`/studentadd?id=${id}`);
            if(user ==='tutor')
               return res.redirect(`/tutoradd?id=${id}`);
            if(user ==='hod')
               return res.redirect(`/hodadd?id=${id}`);
            if(user ==='principal')
               return res.redirect(`/principaladd?id=${id}`);
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

      app.post('/search', (req, res) => {
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM student WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => { 
          if (err) throw err; 
          var applications=[]
          res.render('addnewstudent', { applications:results,id:req.query.id,searchTerm });
        });
      });
    

      app.post('/search1', (req, res) => {
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM tutor WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => { 
          if (err) throw err; 
          var applications=[]
          res.render('addnewtutor', { applications:results,id:req.query.id,searchTerm });
        });
      });   
//       app.post('/reload', (req, res) => {
//   // Perform the query to retrieve all students
//   const query = 'SELECT * FROM tutor';
  
//   db.connection.query(query, (err, results) => {
//     if (err) throw err;
//     var applications = results;
//     res.render('addnewtutor', { applications, id: req.query.id });
//   });
// });
       

      //render in edit in student requestes
      app.get('/edit/:formId', (req, res) => {
        const formId = req.params.formId;
      
        // Retrieve the form data from the database based on the formId
        db.connection.query("SELECT * FROM forms WHERE formid = ?", [formId], (err, results) => {
          if (err) {
            throw err;
          } else {
            const templateContent = results.length > 0 ? results[0].formdata : ''; // Get the template content or set it as an empty string if not found
            res.render('addnewform', { formId, templateContent: templateContent });
          }
        });;
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
