const { Console } = require('console');
const db =require('../controller/dbconnect');
const mail =require("../controller/mailserv");
const verify =require("../controller/verification");
const path=require('path');
const { query } = require('express');

var routes =function(app,isAuth,encoder){      
  
   // Promisify the pool.query method
    const query = (sql, args) => {
      return new Promise((resolve, reject) => {
        db.connection.query(sql, args, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          } 
        });
      });
    };

    
     
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
      app.get('/tform', isAuth, (req, res) => {
        var name = req.query.id;
        var user = req.query.user;
        console.log('ID:', name);
        console.log('User:', user);
        db.connection.query("select * from ?? where id=?", [user, name], (err, results, fields) => {
            if (err) {
                throw err;
            } else {
                var collegeid = results[0].collegeid;
                console.log(collegeid); 
                var result = results[0];
                res.render('tform', { name, collegeid, user, result });
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
          res.render('sform',{name,result}); 
         }
      });    
    }); 
    app.get('/cform/:name',isAuth, (req, res) => {
      var name=req.params.name;
      db.connection.query("select * from college where collegeid=?",
      [name],(err,results,fields)=>{
      if(err) {
        throw err;
        
      }
      else{

        var result=results[0];
        res.render('cform',{name,result});
      }
      });
    });
    app.get('/pform/:name',isAuth, (req, res) => {

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
    app.get('/staffadvisor/:id',isAuth,(req, res) => {
       
      if(req.session.user){
        const username = req.params.id;
        console.log('Username:', username);
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
                console.log('Query Results:', results);
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
              const user='tutor';
              res.render('staffadvisor', { Photo, tutorData, applications,user });
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
          const user='hod';
          res.render('hod', { Photo, tutorData, applications,user });
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
             // console.log(results);
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
      app.get('/tutoradd',isAuth,(req,res)=>{     
          
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
  
     app.get('/hodadd',isAuth,(req,res)=>{
            
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
     app.get('/studentadd',isAuth,(req,res)=>{
                  
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
     app.get('/principaladd',isAuth,(req,res)=>{
           
             
          db.connection.query("select * from  principal",
              [req.body.name],(err,results,fields)=>{
              if(err) {
                throw err;
                
              }
              else{
                var id=req.query.id;
                console.log(id);
                  res.render('addnewprincipal',{applications:results,id});
              }
            }); 
             
        });
        
     app.post('/principaladd',encoder,(req,res)=>{ 

          var {name,id,email}=req.body;
          
          async function getData() {  
            try {
              let Collegeid=req.query.id;
              const id1=Collegeid;    
              var genPassword=verify.randomPassword;
              mail.sendcredEmail(name,email,id,genPassword)  
              const studentsQueryResult = await new Promise((resolve, reject) => {
                db.connection.query("insert into principal (name,id,collegeid,email,password) values(?,?,?,?,?)", [name,id,Collegeid,email,genPassword], (err, results, fields) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(results);
                    res.redirect(`/principaladd?id=${Collegeid}`);
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
  app.get('/requests', isAuth,async(req, res) => {
    let id=req.query.id;
    const query1 = 'SELECT collegeid FROM student WHERE  id = ?';
    const query1Result = await query(query1, [id]);
    var Result=query1Result[0].collegeid
    console.log(Result)
    try {
      db.connection.query("SELECT * FROM forms where collegeid=?",[Result],(err, results, fields) => {
        if (err) {
          throw err;
        } else {
          res.render('requests', { forms: results,id1:null,id});
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
        
  //SUBMIT FORM
  app.get('/submit',isAuth,async(req,res)=>{ 
    const jsonData = req.query.data;
    const data = JSON.parse(jsonData); 
    const formid = data[0].formid; // Accessing the 'formid' property
    const stdid = data[0].id; 
    const content=data[0].content;

      console.log(stdid);
      console.log(content);
      try {
         
        // Execute the first query with arguments
        const query1 = 'SELECT collegeid FROM student WHERE  id = ?';
        const query1Result = await query(query1, [stdid]);
    
        // Execute the second query with arguments
        const query2 = `
              SELECT
                student.collegeid AS collegeId,
                student.id AS studentId,
                forms.formid AS formId,
                student.batch AS batch,
                student.department AS dept,
                forms.name AS formname,
                forms.dest AS dest
              FROM
                student
              JOIN
                forms ON student.collegeid = forms.collegeid AND student.id = ? AND forms.formid = ?
            `;      
        const query2Result = await query(query2, [stdid,formid]);
        if (query2Result.length === 0) {
          // Render a template not found message to the client
          return res.render('template-not-found');
        }
            // Generate a unique ID
              let uniqueId;
              let idExists = true;
              while (idExists) {
                uniqueId = verify.generateUniqueId(8);

                // Check if the ID already exists in the "requests" table
                const checkQuery = 'SELECT COUNT(*) AS count FROM requests WHERE appid = ?';
                const checkResult = await query(checkQuery, [uniqueId]);

                idExists = checkResult[0].count > 0;
              }
        var dest=query2Result[0].dest;
        cpnsole.log('dest=\t'+dest);
        var final='final';
        // Insert the values into the "requests" table
        const insertQuery = `INSERT INTO requests (collegeId, stdid, formid, appid,date,dept,request_data,formname,${dest}) VALUES (?,?,?,?,NOW(),?,?,?,?)`;
        const insertValues = query2Result.map(row => [row.collegeId, row.studentId, row.formId, uniqueId, row.dept, content, row.formname,final]);
        const flattenedValues = insertValues.flat(); // Flatten the nested arrays
        await query(insertQuery, flattenedValues);

        // Render the webpage and pass the query results
        res.redirect(`/requests?id=${stdid}&alertMessage=Successful!`);

      } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send('Error executing queries');
      }
   });

   // SENDING REQUEST ROUTE FOR STUDENTS 
   app.get('/verified_requests',isAuth,(req,res)=>{ 
   try{
    const query1 = 'SELECT dest FROM requests WHERE  id = ?';
    //const query1Result = await query(query1, [req.params.id]);

    db.connection.query("select * from requests where stdid=? ",
    [req.params.id],(err,results,fields)=>{
      if(err) {
        throw err; 
      } 
      else{
        const applications = [];
        res.render('verified_requests',{applications:results});
      }
    });

   }catch(err){
    console.log(err); 
  }  
   
   });
     
   // PENDING REQUEST ROUTE FOR ADMINS 
   app.get('/pending-requests',isAuth,async(req,res)=>{         
        
    const query1 = 'SELECT collegeid FROM college WHERE  collegeid = ?';
    const query1Result = await query(query1, [req.query.id]);
     
    var collegeid=query1Result.collegeid;
         
    const query2 = 'SELECT student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid =? ';
    const query2Result = await query(query2, ['98765432']);
    console.log(query2Result);
    res.render('pending-requests',{applications:query2Result});
    });

    //PENDING REQUESTS FOR TUTOR
   app.get('/tutor-pending-requests',isAuth,async(req,res)=>{         
        
      const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  collegeid = ?';
      const query1Result = await query(query1, [req.query.id]);
       
      var collegeid=query1Result.collegeid;
      var dept=query1Result.department;
      
      const query2 = 'SELECT student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid =? AND student.department=? AND student.batch=? ';
      const query2Result = await query(query2, ['collegeid']);
      console.log(query2Result);
      res.render('pending-requests',{applications:query2Result});
      });

      //PENDING REQUESTS FOR PRINCIPAL
   app.get('/principal-pending-requests',isAuth,async(req,res)=>{         
        
        const query1 = 'SELECT collegeid FROM principal WHERE id = ?';
        const query1Result = await query(query1, [req.query.id]);
         
        var collegeid=query1Result.collegeid;
        var pending='pending';    
        const query2 = 'SELECT student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid =? and requests.principal=?';
        const query2Result = await query(query2, [collegeid,pending]);
        console.log(query2Result);
        res.render('pending-requests',{applications:query2Result});
        });

        //PENDING REQUESTS FOR HOD
   app.get('/hod-pending-requests',isAuth,async(req,res)=>{         
        
          const query1 = 'SELECT collegeid,department FROM hod WHERE id = ?';
          const query1Result = await query(query1, [req.query.id]);
           
          var collegeid=query1Result.collegeid;  
          var dept=query1Result.department;   
          var pending='pending';
          const query2 = 'SELECT student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid =? AND student.department=? AND requests.hod=?';
          const query2Result = await query(query2, [collegeid,dept,pending]);
          console.log(query2Result);
          res.render('pending-requests',{applications:query2Result});
        });
  
  
/*----------- FORM CONTROL AND MAANGEMENT -------------*/

      // ADDING TEMPLATE 
      app.get('/addtemplate',isAuth,(req,res)=>{         
        try{
          var id=req.query.id;
          db.connection.query("select * from forms",
        [req.params.name],(err,results,fields)=>{
        if(err) {
          throw err; 
        } 
        else{
          const divContent = results.length>0?results[0].name:null;
          const applications = results.length>0?results[0].name:null;// Empty array, can be populated later if needed
          res.render('addtemplate',{applications:results,id});
        }
        });
        }catch(err){
          console.log(err); 
        }  
      });
      
      app.get('/get-templates',isAuth, (req, res) => {
        
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
      app.get('/status/:name',isAuth,async(req,res)=>{
        try{
          db.connection.query("select * from requests  join student on requests.stdid=student.id and student.id=? ",
        [req.params.name],(err,results,fields)=>{
        if(err) {
          throw err; 
        } 
        else{
          
          const applications =results; // Empty array, can be populated later if needed
          res.render('status',{ divContent, applications });
        }
        }); 
        }catch(err){
          console.log(err); 
        }

    })

    //REQUEST DISPLAY
    app.get('/form/:selectedFormId',isAuth, (req, res) => {
      const formId = req.params.selectedFormId;
    console.log(formId);
      db.connection.query("SELECT formdata FROM forms WHERE formid = ?", [formId], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error retrieving HTML content');
        } else {
          if (results.length > 0) {
            const fetchedHTML = results[0].formdata;
            res.send(fetchedHTML);
          } else {
            res.status(404).send('HTML content not found');
          }
        }
      });
    });
    
    //request
      //REQUEST DISPLAY
      app.get('/requ/:selectedFormId',isAuth, (req, res) => {
        const formId = req.params.selectedFormId;
        db.connection.query("SELECT request_data FROM requests WHERE appid = ?", [formId], (err, results) => {
          if (err) {
            console.error(err);  
            res.status(500).send('Error retrieving HTML content');
          } else {
            if (results.length > 0) {
              const fetchedHTML = results[0].request_data;
              res.send(fetchedHTML);
            } else {
              res.status(404).send('HTML content not found');
            }
          }
        });
      });
      

     //SAVING TEMPLATEFORMS
     app.post('/save-template',(req,res)=>{   
      var name=req.query.name; 
      //console.log(name);
      var collegeid=req.query.id; 
      console.log(name);
      var divContent = req.body.content; 
     //  console.log(divContent);
       db.connection.query("insert into forms(name,collegeid,formdata)values(?,?,?)",
         [name,collegeid,divContent],(err,results,fields)=>{
          if(err) {
            throw err; 
          } else{
             res.redirect(`/addtemplate?id=${collegeid}`);
          }    
       });
       });
     
     //ADD OR EDIT FORMS
     app.get('/addnewform',isAuth,(req, res) => {
      const id= req.query.id;
      const templateName = req.query.name; // Get the template name from the query parameter
  
      // Fetch the template content from the server
      db.connection.query('SELECT formdata FROM forms WHERE name = ?', [templateName], (err, results, fields) => {
        if (err) {
          throw err;
        } else {
          const templateContent = results.length > 0 ? results[0].formdata : ''; // Get the template content or set it as an empty string if not found
          res.render('addnewform', { templateName: templateName, templateContent: templateContent ,id});
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
       

      app.post('/deleteuser', encoder, (req, res) => { 
        var id = req.query.id; 
        var user = req.query.user;
        var returnid=req.query.returnid;;
        db.connection.query("DELETE FROM ?? WHERE id = ?", [req.query.user, req.query.id], (err, results, fields) => {
          if (err) {
            res.send('server error');  
            throw err;
          } else {
            if (user === 'student')
              return res.redirect(`/studentadd?id=${id}`);
            if (user === 'tutor')
              return res.redirect(`/tutoradd?id=${returnid}`);
            if (user === 'hod')
              return res.redirect(`/hodadd?id=${id}`);
            if (user === 'principal')
              return res.redirect(`/principaladd?id=${id}`);
          }
        }); 
      });
      
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


      app.post('/staffadvisor/:name/search', (req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM student WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewstudent', { applications, id: req.params.name, searchTerm });
          }
        });
      });
 
      app.post('/hod/:name/search', (req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM tutor WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewtutor', { applications, id: req.params.name, searchTerm });
          }
        });
      });


      app.post('/principal/:name/search', (req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM hod WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewhod', { applications, id: req.params.name, searchTerm });
          }
        });
      });
         
      app.post('/college/:name/search', (req, res) => { // Specify the URL for search with the name parameter
        const searchTerm = req.body.search;
      
        // Perform search query
        const query = `SELECT * FROM principal WHERE
          name LIKE '%${searchTerm}%' OR
          id LIKE '%${searchTerm}%'`;
      
        db.connection.query(query, (err, results) => {
          if (err) {
            console.log(err);
            res.send('Server error: ' + err.message);
          } else {
            const applications = results;
            res.render('addnewprincipal', { applications, id: req.params.name, searchTerm });
          }
        });
      });    
       
      //OTP VERIFICATION
      app.get('/otpverify',isAuth,(req, res) => {
        const jsonData = req.query.data;
        const data = JSON.parse(jsonData); 
        const formid = data[0].formid; // Accessing the 'formid' property
        const stdid = data[0].id; 
       
        db.connection.query('SELECT name,email FROM student WHERE id = ?', [stdid], (err, results, fields) => {
          if (err) {
            throw err;
          } else {
            const email = results.length > 0 ? results[0].email : '';
            const name=results.length>0?results[0].name:''; // Get the template content or set it as an empty string if not found
            var genOtp=verify.generateOTP();        
             // mail.sendOTPEmail(name,email,genOtp);
              req.session.otp = genOtp; 
              console.log(genOtp)
              //const jsonData = JSON.stringify(data);
              res.render('otpverify', {otp:genOtp,jsonData});
          }
        });;
       });

             //OTP VERIFICATION
      app.post('/otpverify',isAuth,(req, res) => {
        console.log(req.body)  
        const jsonData = req.body.jsonData;
        const submittedOTP = req.body.otp;
        const storedOTP = req.session.otp;
        console.log("in post otp=\t"+storedOTP);
        if (submittedOTP === storedOTP) {
          // OTP verification successful  
          // Handle form submission here
         
          // Clear the OTP from the session after successful submission
          delete req.session.otp;
          res.redirect(`/submit?data=${encodeURIComponent(jsonData)}`);
        } else {
          // Invalid OTP, display an error or redirect to the OTP verification page
          res.send('Invalid OTP. Please try again.');     
        }   
      
       });
      
       //UPLOAD ATTCHMENT FILES FOR STUDENTS
       app.post('/upload', async(req, res) => {
       
        const id = req.query.id;
        console.log('here' + id);
        console.log(req.body);
        if (!req.files || !req.files.file) {

          console.log('no file uploaded');
          return res.status(400).json({ error: 'No file uploaded' });
        
        }
        
        // Retrieve file information from request
        const file = req.files.file;
        console.log(file);

        // Insert file data into the MySQL database
        const query1 = 'select * from student';
        const values = [req.body.attaname, file.mimetype, file.size];
        
        try {
          const result = await query(query1,values);

          console.log(result);
          // Retrieve the generated file ID
         // const fileId = result.insertId;
        
          // Update the file ID in the file object
         // file.fileId = fileId;
        
          // Continue with additional file processing or response handling
          // For example, you can save the file to a specific location on the server
          // or perform further operations based on the file ID
        
          res.status(200).json({ message: 'File uploaded successfully', fileId });
        } catch (error) {
          // Handle database errors
          console.error(error);
          res.status(500).json({ error: 'Database error' });
        }
        
  
      
      });
       

      //render in edit in student requestes
      app.get('/edit', isAuth,(req, res) => {
        const formid = req.query.Formid;
        const id=req.query.id;
        
        // Retrieve the form data from the database based on the formId
        db.connection.query("SELECT * FROM forms WHERE formid = ?", [formid], (err, results) => {
          if (err) {
            throw err; 
          } else {
            const templateContent = results.length > 0 ? results[0].formdata : ''; // Get the template content or set it as an empty string if not found
            res.render('newform', { formid, templateContent: templateContent,id });
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
