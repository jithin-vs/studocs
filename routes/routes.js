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
          res.render('hod', {Photo, tutorData, applications,user });
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
    app.get('/student/:name',isAuth,async(req, res) => {
      console.log(req.params.name);
      if(req.session.user){
        try{
          const query1 = 'SELECT * FROM attachment where stdid=?';
          const query1Result = await query(query1, [req.params.name]);
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
              res.render('student',{name,admno,regno,dept,phno,addr,email,photo,attachments:query1Result})}
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

     app.get('/college/:name',isAuth,async(req, res) => {
      var username=req.params.name;    
      if(req.session.user){
        if (req.session.user) {
          try {
            const query1 = `SELECT 
                              student.name AS name, student.id AS studentId, requests.formname AS formname,
                              requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
                              FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?`;
            const query1Result = await query(query1, [username]);
           console.log(query1Result);
            const selectQuery = "SELECT * FROM college WHERE collegeid = ?";
        
            try {
              const results = await query(selectQuery, [username]);
        
              if (results.length > 0) {
                const { collegename, collegeid, phno, address, email, collegeimage, website } = results[0];
        
                const imagePath = path.relative('public', collegeimage);
        
                const collegeData = {
                  Name: collegename || 'N/A',
                  Id: collegeid || 'N/A',
                  Phno: phno || 'N/A',
                  Addr: address || 'N/A',
                  Email: email || 'N/A',
                  Photo: imagePath || 'N/A',
                  Website: website || 'N/A'
                };
        
                console.log(collegeData);
        
                // Render the 'college' template and pass the query results and collegeData
                res.render('college', { applications: query1Result, collegeData });
              } else {
                // Handle case when no college is found for the given username
                console.log('No college found for the given username');
                res.render('college', { applications: query1Result, collegeData: null });
              }
            } catch (error) {
              // Handle the error
              console.error('Error occurred during college retrieval:', error);
              res.render('college', { applications: query1Result, collegeData: null });
            }
          } catch (error) {
            // Handle the error
            console.error('Error occurred during query execution:', error);
            res.render('college', { applications: null, collegeData: null });
          }
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
              db.connection.query("SELECT collegeid,batch,department FROM tutor WHERE id=?", [tutorid], (err, results, fields) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(results);
                  resolve(results);  
                }
              }); 
            });
        
            Collegeid = hodQueryResult[0].collegeid;
            var batch = hodQueryResult[0].batch;
            var department = hodQueryResult[0].department;
            console.log(Collegeid); // Output the updated Collegeid value here
            var genPassword=verify.randomPassword;
            mail.sendcredEmail(name,email,id,genPassword);
            const studentsQueryResult = await new Promise((resolve, reject) => {  
              db.connection.query("insert into student (name,id,collegeid,email,password,batch,department) values(?,?,?,?,?,?,?)", [name,id,Collegeid,email,genPassword,batch,department], (err, results, fields) => {
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

        var dest = query2Result[0].dest || 'principal';
        console.log('dest=\t'+dest);
        var final='final';
        var pending='pending';
        // Insert the values into the "requests" table
        const insertQuery = `INSERT INTO requests 
                             (collegeId, stdid, formid, appid,date,dept,request_data,formname,${dest},tutor,dest)
                             VALUES (?,?,?,?,NOW(),?,?,?,?,?,?)`;
        const insertValues = query2Result.map(row => [row.collegeId, row.studentId, row.formId, uniqueId, row.dept, content, row.formname,final,pending,row.dest]);
        const flattenedValues = insertValues.flat(); // Flatten the nested arrays
        await query(insertQuery, flattenedValues);

        // Render the webpage and pass the query results
        res.redirect(`/requests?id=${stdid}&alertMessage=Successful!`);

      } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send('Error executing queries');
      }
   });

         /*-------------------- VERIFIED REQUESTS  --------------------*/

   // SENDING REQUEST ROUTE FOR STUDENTS 
   app.get('/verified-requests',isAuth,(req,res)=>{ 
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

   app.get('/tutor-verified-requests',isAuth,async(req,res)=>{ 
      
        const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  id = ?';
        const query1Result = await query(query1, [req.query.id]);
        console.log(query1Result)
        var collegeid=query1Result[0].collegeid;
        var dept=query1Result[0].department;
        var batch=query1Result[0].batch;
        var checkVal1='verified';
        var checkVal2='completed';
        var checkVal3='rejected';
        //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
        const query2 = `SELECT 
              student.name AS name, student.id AS studentId, requests.formname AS formname,
              requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
              FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?  AND student.id=requests.stdid AND student.department=? AND student.batch=? AND requests.tutor IN(?,?,?)`;
        const query2Result = await query(query2, [collegeid,dept,batch,checkVal1,checkVal2,checkVal3]);
        //console.log(query2Result);
        res.render('verified-requests',{id:req.query.id,applications:query2Result});
    });

   app.get('/hod-verified-requests',isAuth,async(req,res)=>{ 
                
        const query1 = 'SELECT collegeid,department FROM hod WHERE id = ?';
        const query1Result = await query(query1, [req.query.id]);
        
        var collegeid=query1Result[0].collegeid;  
        var dept=query1Result[0].department;   
        var checkVal1='verified';
        var checkVal2='completed';
        var checkVal3='rejected';
        console.log('cid='+collegeid+',dept='+dept+'status='+pending)
        const query2 = `SELECT
              student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,
              requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date 
              FROM student JOIN requests ON student.collegeid = requests.collegeid  AND 
              student.id=requests.stdid AND student.collegeid =?  AND student.id=requests.stdid  AND student.department=? AND requests.hod IN(?,?,?)`;
        const query2Result = await query(query2, [collegeid,dept,checkVal1,checkVal2,checkVal3]);
        console.log(query2Result);
        res.render('pending-requests',{id:req.query.id,applications:query2Result});
      });

   app.get('/principal-verified-requests',isAuth,async(req,res)=>{ 
      
        const query1 = 'SELECT collegeid FROM principal WHERE id = ?';
        const query1Result = await query(query1, [req.query.id]); 
        var collegeid=query1Result[0].collegeid;
        var checkVal1='verified';
        var checkVal2='completed';
        var checkVal3='rejected';
        console.log(collegeid)
        const query2 = `SELECT 
        student.name AS name, student.id AS studentId, requests.formname AS formname,
        requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
        FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ? AND student.id=requests.stdid AND requests.principal IN (?,?,?)`;
        const query2Result = await query(query2, [collegeid,checkVal1,checkVal2,checkVal3]);
        console.log(query2Result);
        res.render('verified-requests',{applications:query2Result});
        
        });

   app.get('/office-verified-requests',isAuth,async(req,res)=>{ 
            
            var checkVal1='verified';
            var checkVal2='completed';
            var checkVal3='rejected';
            const query1 = `SELECT 
                    student.name AS name, student.id AS studentId, requests.formname AS formname,
                    requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
                    FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ?  AND student.id=requests.stdid AND  requests.office IN(?,?,?)`;
            const query1Result = await query(query1, [req.query.id,checkVal1,checkVal2,checkVal3]);
            console.log(query1Result);
            res.render('verified-requests',{id:req.query.id,applications:query1Result}); 
          
          });

       /*-------------------- PENDING REQUESTS  --------------------*/  
     
   // PENDING REQUEST ROUTE FOR ADMINS 
   app.get('/office-pending-requests',isAuth,async(req,res)=>{         
        
         
    const query1 = `SELECT 
    student.name AS name, student.id AS studentId, requests.formname AS formname,
    requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
    FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.id=requests.stdid AND student.collegeid = ?`;
    const query1Result = await query(query1, [req.query.id]);
    console.log(query1Result);
    res.render('pending-requests',{id:req.query.id,applications:query1Result}); 
    });

    //PENDING REQUESTS FOR TUTOR
   app.get('/tutor-pending-requests',isAuth,async(req,res)=>{         
        
      const query1 = 'SELECT collegeid,batch,department FROM tutor WHERE  id = ?';
      const query1Result = await query(query1, [req.query.id]);
      console.log(query1Result)
      var collegeid=query1Result[0].collegeid;
      var dept=query1Result[0].department;
      var batch=query1Result[0].batch;  
      const pending='pending';
      //console.log('cid='+collegeid+',dept='+dept+',batch='+batch+',status='+pending)
      const query2 = `SELECT 
            student.name AS name, student.id AS studentId, requests.formname AS formname,
            requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
            FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ? AND student.department=? AND student.batch=? AND requests.tutor=?`;
      const query2Result = await query(query2, [collegeid,dept,batch,pending]);
      //console.log(query2Result);
      res.render('pending-requests',{id:req.query.id,applications:query2Result});
      });

      //PENDING REQUESTS FOR PRINCIPAL
   app.get('/principal-pending-requests',isAuth,async(req,res)=>{         
        
        const query1 = 'SELECT collegeid FROM principal WHERE id = ?';
        const query1Result = await query(query1, [req.query.id]);  
         
        var collegeid=query1Result[0].collegeid;
        var pending1='pending';
        var pending2='final:pending';
        const query2 = `SELECT 
        student.name AS name, student.id AS studentId, requests.formname AS formname,
        requests.appid AS appid, student.batch AS batch, student.department AS dept, requests.date AS date 
        FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid = ? AND student.id=requests.stdid AND requests.principal IN (?,?)`;
        const query2Result = await query(query2, [collegeid,pending1,pending2]);
        console.log(query2Result);
        res.render('pending-requests',{applications:query2Result});
        });

        //PENDING REQUESTS FOR HOD
   app.get('/hod-pending-requests',isAuth,async(req,res)=>{         
        
          const query1 = 'SELECT collegeid,department FROM hod WHERE id = ?';
          const query1Result = await query(query1, [req.query.id]);
           
          var collegeid=query1Result[0].collegeid;  
          var dept=query1Result[0].department;   
          var pending='pending';
          console.log('cid='+collegeid+',dept='+dept+'status='+pending)
          const query2 = 'SELECT student.collegeid AS collegeId, student.id AS studentId,requests.formname AS formname,requests.appid AS appid, student.batch AS batch, student.department AS dept ,requests.date AS date FROM student JOIN requests ON student.collegeid = requests.collegeid AND student.collegeid =? AND student.department=? AND requests.hod=?';
          const query2Result = await query(query2, [collegeid,dept,pending]);
          console.log(query2Result);
          res.render('pending-requests',{id:req.query.id,applications:query2Result});
        });
  
  
/*----------- FORM CONTROL AND MAANGEMENT -------------*/

      // ADDING TEMPLATE 
      app.get('/addtemplate',isAuth,async(req,res)=>{         
        try{
          const query1 = 'SELECT * FROM forms WHERE  stdid = ?';
          const query1Result = await query(query1, [req.query.id]);
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
      
      //STATUS table  DISPLAY
      app.get('/status/:name',isAuth,async(req,res)=>{
        var active1=" ",active2=" ",active3=" ",active4=" ";
        try{
          db.connection.query("select * from requests  join student on requests.stdid=student.id and student.id=? ",
        [req.params.name],(err,results,fields)=>{
        if(err) { 
          throw err;  
        } 
        else{
          
          const applications =results;
          active1 = "";
         active2 = "";
          active3 = "";
          active4 = "";
          
          // Empty array, can be populated later if needed
          res.render('status',{ applications,active1,active2,active3,active4 });
        }
        }); 
        }catch(err){
          console.log(err); 
        }

    });
    //ststus
    app.post('/fetch-request-data', (req, res) => {
      const { appid } = req.body;
   
          db.connection.query("SELECT * FROM requests WHERE appid = ?", [appid], (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error occurred while fetching request data.');
        } else {
          const requestData = results[0].request_data;
          let active1 = '';
  let active2 = '';
  let active3 = '';
  let active4 = '';

  if (results[0].tutor === 'verified') {
    active1 = 'active';
  } 
   if (results[0].hod === 'verified') {
    active2 = 'active';
  } 
   if (results[0].principal === 'verified') {
    active3 = 'active';
  } 
   if (results[0].office === 'verified') {
    active4 = 'active';
  }
    const responseData = {
      active1: active1, 
      active2: active2,
      active3: active3,
      active4: active4
    };
  
          console.log(responseData);
        
          res.send({ requestData: requestData, responseData: responseData });
        }
      });
    });
    
    

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
      const selectedOption = req.body.selectedOption;
      console.log(selectedOption);
      //console.log(name);
      var collegeid=req.query.id; 
      console.log(name);
      var divContent = req.body.content; 
     //  console.log(divContent);
       db.connection.query("insert into forms(name,collegeid,formdata,dest)values(?,?,?,?)",
         [name,collegeid,divContent,selectedOption],(err,results,fields)=>{
          if(err) {
            throw err; 
          } else{
              res.render('addtemplate');
             //res.redirect(`/addtemplate?id=${collegeid}`);
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

     //VERIFY FORM BY ADMINISTRATORS
     app.get('/verify-form',async(req,res)=>{ 
        var appid=req.query.appid;
        var user=req.query.user;
        var nextUser;
        console.log('user'+user)
        switch (user.toLowerCase()) {
          case 'tutor'    : nextUser = 'hod' ;       break;
          case 'hod'      : nextUser = 'principal' ; break;
          case 'principal': nextUser = 'office' ;    break;
        }   
        if(user ==='office')
           nextUser=user; 
        console.log(nextUser+','+appid);
       // Check the flag column value before executing the update query
          const checkQuery = `SELECT ${user},${nextUser} FROM requests WHERE appid =?`;  
          
          try {
            const checkResult = await query(checkQuery, [appid]);
            console.log(checkResult);
            const userValue = checkResult[0][user];
            const nextUserValue= checkResult[0][nextUser];
            console.log("user value="+userValue);
              if (checkResult.length > 0 && checkResult[0][user]=== 'final:pending') {
                console.log('form path ended.');
                const updateQuery = `UPDATE requests SET ${user} = 'completed' WHERE appid = ?`;
                try {
                  const updateResult = await query(updateQuery, [appid]);  
                  // Process the update result
                  console.log('Update successful');
                  res.redirect(`/${user}-pending-requests?id=${req.query.id}&user=${user}`)
                } catch (error) {
                  // Handle the error
                  console.error('Error occurred during update:', error);
                }
              }else {
                let updateQuery;
                if (nextUserValue=== 'final') {
                  updateQuery = `UPDATE requests SET ${user} = 'verified', ${nextUser} = 'final:pending' WHERE appid = ?`;
                } else {
                  updateQuery = `UPDATE requests SET ${user} = 'verified', ${nextUser} = 'pending' WHERE appid = ?`;
                }

                try {
                  const updateResult = await query(updateQuery, [appid]);
                  // Process the update result
                  console.log('Update successful');
                  res.redirect(`/${user}-pending-requests?id=${req.query.id}&user=${user}`);
                } catch (error) {
                  // Handle the error  
                  console.error('Error occurred during update:', error);
                }
              }
              
          } catch (error) {
            // Handle the error
            console.error('Error occurred during flag check:', error);
          }

     })

      //REJECT FORM BY ADMINISTRATORS
     app.get('/reject-form',async(req,res)=>{ 
        var appid=req.query.appid;
        var user=req.query.user;
 
        console.log('appid='+appid);
          try {
            const updateQuery = `UPDATE requests SET ${user} = 'rejected' WHERE appid = ?`;
                try {
                  const updateResult = await query(updateQuery, [appid]);  
                  // Process the update result
                  console.log('Update successful');
                  res.redirect(`/${user}-pending-requests?id=${req.query.id}&user=${user}`)
                } catch (error) {
                  // Handle the error
                  console.error('Error occurred during update:', error);
                }        
          } catch (error) {
            // Handle the error
            console.error('Error occurred during flag check:', error);
          }

     })
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
        var returnid=req.query.returnid;
        console.log('user'+user);
        console.log('hererdfxf'); 
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
            res.render('newform', { formid,id,templateContent: templateContent});
      }
    }); 
  });
      
      //upload student attachment 
      const otpGenerator = require('otp-generator');
      
      function generateUniqueID() {
        return new Promise((resolve, reject) => {
          const uniqueID = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
          // Check if the generated ID is already present in the database
          const sql = 'SELECT attaid FROM attachment WHERE attaid = ?';
          db.connection.query(sql, [uniqueID], function (error, results) {
            if (error) {
              console.error('Error checking uniqueness of attaid');
              reject(error);
            }
            if (results.length === 0) {
              resolve(uniqueID); // Return the unique ID if it is not present in the database
            } else {
              resolve(generateUniqueID()); // Generate a new unique ID recursively if it is already present
            }
          });
        });
      }
      
      app.post('/upload/:name', (req, res) => {
        const { attaname } = req.body;
        const name = req.params.name;
        let collegeid, regno;

        if (!req.files || !req.files.file) {
          // Display error notification using SweetAlert
          return res.status(400).send('<script>Swal.fire("Error", "No file selected", "error");</script>');
        }
        db.connection.query("SELECT * FROM student WHERE id = ?", [name], (err, results1, fields) => {
          if (err) {
            throw err;
          } else {
            collegeid = results1[0].collegeid;
            regno = results1[0].id;
    
            generateUniqueID()
            .then(attaid => {
              const uploadedFile = req.files.file; // Assuming the file input field name is "file"
              var filePath = path.join('./public/uploads/student', regno.toString(), uploadedFile.name);
              console.log(filePath);
              
              uploadedFile.mv(filePath)
                .then(() => {
                  console.log('Upload successful');
                  filePath = filePath.replace('public', '');
                  return generateUniqueID();
                })
                .then(attaid => {
                  console.log(attaid);
                  console.log(regno);
                  console.log(collegeid);
              
                  const sql = 'INSERT INTO attachment (stdid, collegeid, attaid, attaname, file) VALUES (?, ?, ?, ?, ?)';
                  db.connection.query(sql, [regno, collegeid, attaid, attaname, filePath], function (error, results) {
                    if (error) {
                      console.error('Error saving attachment to the database');
                      res.status(500).send('Internal Server Error'+error);
                    } else {
              
                          res.redirect(`/student/${regno}`);

                    }
                  });
                })
                .catch(error => {
                  console.error('Error uploading file or generating unique ID', error);
                  res.status(500).send('Internal Server Error');
                });
              
             })
            .catch(error => {
              console.error('Error generating unique ID', error);
              res.status(500).send('Internal Server Error');
            });
           
          }
        }); 
      });
      app.post('/remove', function (req, res) {
        const attachmentId = req.body.attachmentId;
        const Id = req.query.regno;
        console.log(attachmentId);
        console.log(Id);
        const sql = 'DELETE FROM attachment WHERE attaid = ?';
        db.connection.query(sql, [attachmentId], function (error, results) {
          if (error) {
            console.error('Error removing attachment from the database',attachmentId);
            console.error(error);
          }
          console.log(query);
          res.redirect(`/student/${Id}#docs`);
        });
      }); 
      //delete template
      app.get('/delete', (req, res) => {
        const templateName = req.query.name;
      
        // Delete the corresponding records in the `requests` table first
        const deleteRequestsQuery = 'DELETE FROM requests WHERE formid IN (SELECT formid FROM forms WHERE name = ?)';
      
        db.connection.query(deleteRequestsQuery, [templateName], (err, result) => {
          if (err) {
            console.error('Error deleting requests: ', err);
            res.sendStatus(500);
            return;
          }
      
          // Delete the template from the `forms` table
          const deleteFormQuery = 'DELETE FROM forms WHERE name = ?';
      
          db.connection.query(deleteFormQuery, [templateName], (err, result) => {
            if (err) {
              console.error('Error deleting template: ', err);
              res.sendStatus(500);
            } else {
              console.log('Template deleted successfully');
              
              // Render the page with the `id` parameter
              const id = req.query.id;
              res.redirect(`/addtemplate?id=${id}`);
            } 
          });
        });
      });
      
      app.get('/psw-reset', (req, res) => {
        res.render('forget');
      })
     
      app.post('/delete', (req, res) => {
          const { user, username } = req.session.resetPasswordData;
          const newPassword = req.body.newPassword;
          
          // Update the password based on the user type
          switch (user) {
            case 'college':
              // Update the college password in the database
              db.connection.query(
                'UPDATE college SET password = ? WHERE collegeid = ?',
                [newPassword, username],
                (err, results) => {
                  if (err) {
                    console.error(err);
                    return res.send('Server error');
                  }
                  
                  // Password updated successfully
                  res.send('Password reset successfully!');
                }
              );
              break;
              
            case 'Student':
              // Update the student password in the database
              db.connection.query(
                'UPDATE Student SET password = ? WHERE id = ?',
                [newPassword, username],
                (err, results) => {
                  if (err) {
                    console.error(err);
                    return res.send('Server error');
                  }
                  
                  // Password updated successfully
                  res.send('Password reset successfully!');
                }
              );
              break;
              
            case 'Tutor':
              // Update the tutor password in the database
              db.connection.query(
                'UPDATE Tutor SET password = ? WHERE id = ?',
                [newPassword, username],
                (err, results) => {
                  if (err) {
                    console.error(err);
                    return res.send('Server error');
                  }
                  
                  // Password updated successfully
                  res.send('Password reset successfully!');
                }
              );
              break;
              
            case 'Hod':
              // Update the HOD password in the database
              db.connection.query(
                'UPDATE Hod SET password = ? WHERE id = ?',
                [newPassword, username],
                (err, results) => {
                  if (err) {
                    console.error(err);
                    return res.send('Server error');
                  }
                  
                  // Password updated successfully
                  res.send('Password reset successfully!');
                }
              );
              break;
              
            case 'Principal':
              // Update the principal password in the database
              db.connection.query(
                'UPDATE Principal SET password = ? WHERE id = ?',
                [newPassword, username],
                (err, results) => {
                  if (err) {
                    console.error(err);
                    return res.send('Server error');
                  }
                  
                  // Password updated successfully
                  res.send('Password reset successfully!');
                }
              );
              break;
              
            default:
              res.send('Invalid user type');
          }
        });
        


        //downmload pdf
        const path = require('path');

        app.get('/download', (req, res) => {
          const filePath = req.query.file; // Get the file path from the query parameter
        
          // Check if the file exists
          if (!filePath) {
            return res.status(404).send('File not found.');
          }
        
          // Resolve the absolute file path
          const absolutePath = path.join(__dirname, '..', 'public', filePath);
        
          // Set the appropriate headers
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'inline'); // Open file in browser tab
        
          // Send the file as the response
          res.sendFile(absolutePath);
        });
        
         

    
}  

module.exports = routes;
