const express = require('express');
const router = express.Router();
const alert = require('alert');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const {check, validationResult} = require('express-validator');
const connection  = require('../lib/database');

const log4js = require('log4js');
log4js.configure('./src/config/log4js.config.json');
const systemLogger = log4js.getLogger('system'); 
const httpLogger = log4js.getLogger('http'); 
const accessLogger = log4js.getLogger('access');
router.use(log4js.connectLogger(accessLogger));
router.use((req, res, next) => {
  if (typeof req === 'undefined' || req === null ||
        typeof req.method === 'undefined' || req.method === null ||
        typeof req.header === 'undefined' || req.header === null) {
    next();
    return;
  }
  if (req.method === 'GET' || req.method === 'DELETE') {
    httpLogger.info(req.query);
  } else {
    httpLogger.info(req.body);
  }
  next();
});
systemLogger.info("users start");

/* GET users listing. */
router.get('/', (req, res, next) =>{
    var data ={
        title:'signin',
        content:'',
        form:{name:'',password:''}
    };
    res.render('users/signin',data);
});

router.get('/signin', (req, res, next) => {
    var data ={
        title:'signin',
        content:'',
        form:{name:'',password:''}
    };
    res.render('users/signin',data);
});

router.post('/signin',
    [
        check('name','user name は必ず入力してください').notEmpty().escape(),
        check('password','password は必ず入力してください').notEmpty().escape()
    ],async (req,res,next)=>{
    const errors = validationResult(req);
    
    //const hash = req.body.password;
    if(!errors.isEmpty()){
        var result = '<ul class="text-danger">';
        var result_arr = errors.array();
        for(var i in result_arr){
            result += '<li>' + result_arr[i].msg + '</li>'
        }
        result += '</ul>'
        var data ={
            title:'signin',
            content:result,
            form:{name:'',password:''}
        }
        res.render('users/signin',data);
    }else{
        const nm =req.body.name;
        const ps = req.body.password;
        
        
        connection.query('SELECT password,user_id FROM User WHERE user_name = ? ;', [nm], async (err, rows, next)=> {
            if(err) throw err;
            
           
            // if user not found
            if (rows.length <= 0) {
                var result = '<ul class="text-danger"><li>user nameかpasswordが間違っています </li></ul>';
                var data ={
                    title:'signin',
                    content:result,
                    form:{name:'',password:''}
                };
                res.render('users/signin',data);
            }
            else 
            { // if user found
                const compared = await bcrypt.compare(ps,rows[0].password);
                if(compared){
                    var uid = rows[0].user_id;
                    var redi = '../select?uid=' + uid;
                    req.session.uid = uid;
                    res.redirect('../select');
                }else{
                    var result = '<ul class="text-danger"><li>user nameかpasswordが間違っています </li></ul>';
                    var data ={
                        title:'signin',
                        content:result,
                        form:{name:'',password:''}
                    };
                    res.render('users/signin',data);
                }
                
                
 
            }            
        });

        
        
    }
});



router.get('/signup', (req, res, next) => {
    var data ={
        title:'signup',
        content:'',
        form:{name:'',mail:'',password:'',repassword:''}
    };
    res.render('users/signup',data);
});


router.post('/signup',
    [
        check('name','user name は必ず入力してください').notEmpty().escape(),
        check('name','user name は英大文字、英小文字、数字を含む8文字以上入力してください').matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,300}$/).escape(),
        check('mail','mailは必ず入力してください').notEmpty().escape(),
        check('mail','mailはメールアドレスを入力してください').isEmail().escape(),
        check('password','password は必ず入力してください').notEmpty().escape(),
        check('password','password は英大文字、英小文字、数字を含む8文字以上入力してください').matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,300}$/).escape(),
        check('repassword','Re-Enter password は必ず入力してください').notEmpty().escape()
    ],async(req,res,next)=>{
    const errors = validationResult(req);
    const nm =req.body.name;
    const mail = req.body.mail;
    const ps = req.body.password;
    const reps = req.body.repassword;
    if(!errors.isEmpty()){
        var result = '<ul class="text-danger">';
        var result_arr = errors.array();
        for(var i in result_arr){
            result += '<li>' + result_arr[i].msg + '</li>';
        }
        
        result += '</ul>'
        var data ={
            title:'signup',
            content:result,
            form:{name:'',mail:'',password:'',repassword:''}
        }
        res.render('users/signup',data);
    }else{
        
        const hps = await bcrypt.hash(req.body.password,15);
        const hml = await bcrypt.hash(req.body.mail,10);
        const q1 = 'SELECT * FROM User WHERE user_name =  ? ;';
        const q2 = 'SELECT * FROM User WHERE password = ? ;';
        const q3 = 'SELECT * FROM User WHERE mail = ? ;';
        connection.query(q1 + q2 + q3,[nm,hps,mail], (err, rows)=> {
            if(err) throw err;
            var result = '<ul class="text-danger">';
            // if user not found
            console.log(rows[0]);
            console.log('=============');
            console.log(rows[1]);
            console.log(rows);
            if(ps == reps){
                if (rows[0].length>0 || rows[1].length>0|| rows[2].length>0) {
                
                
                    result += '<li>そのuser nameかmailかpasswordは使用できません</li></ul>';
                    
                    var data ={
                        title:'signup',
                        content:result,
                        form:{name:'',mail:'',password:'',repassword:''}
                    };
                    res.render('users/signup',data);
                }
                else if(ps == nm){
                    result += '<li>user nameとpasswordは違うものを設定してください</li></ul>';
                    
                    var data ={
                        title:'signup',
                        content:result,
                        form:{name:'',mail:'',password:'',repassword:''}
                    };
                    res.render('users/signup',data);
                }else{ // if user found
                    connection.query('insert into User (user_name,password,regist_date,mail) values ( ? , ? , CURDATE() , ? );',[nm,hps,hml]);
                    
                    var data ={
                        title:'signup',
                        content:'登録が完了しました',
                        form:{name:'',mail:'',password:'',repassword:''}
                    };
                    res.render('users/signup',data);
                    
                }  
            }else{
                result += '<li>passwordとRe-Enter passwordが一致しません</li></ul>';
                var data ={
                    title:'signup',
                    content:result,
                    form:{name:'',mail:'',password:'',repassword:''}
                };
                res.render('users/signup',data);
            }

                      
        });

        
        
    }
});

router.get('/changepass', (req, res, next) => {
    var data ={
        title:'change password',
        content:'',
        form:{name:'',mail:'',password:'',repassword:''}
    };
    res.render('users/changepass',data);
});

router.post('/changepass',
    [
        check('name','user name は必ず入力してください').notEmpty().escape(),
        check('mail','mailは必ずメールアドレスを入力してください').notEmpty().isEmail().escape(),
        check('password','password は必ず入力してください').notEmpty().escape(),
        check('password','password は英大文字、英小文字、数字を含む8文字以上入力してください').matches(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,300}$/).escape(),
        check('repassword','Re-Enter password は必ず入力してください').notEmpty().escape()
    ],async(req,res,next)=>{
    console.log(req.body);
    const errors = validationResult(req);
    const nm =req.body.name;
    const mail = req.body.mail;
    const ps = req.body.password;
    const reps = req.body.repassword;
    
    if(!errors.isEmpty()){
        var result = '<ul class="text-danger">';
        var result_arr = errors.array();
        for(var i in result_arr){
            result += '<li>' + result_arr[i].msg + '</li>'
        }
        if(ps != reps){
            result += '<li>Re-Enter password とpasswordが一致しません</li>';
        }
        result += '</ul>'
        var data ={
            title:'change password',
            content:result,
            form:{name:'',mail:'',password:'',repassword:''}
        }
        res.render('users/changepass',data);
    }else{
        const hps = await bcrypt.hash(ps,15);
        const hml = await bcrypt.hash(mail,10);
        const q1 = 'SELECT * FROM User WHERE user_name = ? ;';
        const q2 = 'SELECT * FROM User WHERE password = ? ;';
        console.log(hps);
        console.log(hml);
        connection.query(q1 + q2,[nm,hps], async (err, rows)=> {
            console.log(rows);
            if(err) throw err;
            var result = '<ul class="text-danger">';
            // if user not found
            console.log(req.body);
            if(rows[0].length>0 ){
                if(ps == reps){
                    if (rows[1].length>0) {
                    
                    
                        result += '<li>そのpasswordは使用できません</li></ul>';
                        
                        var data ={
                            title:'change password',
                            content:result,
                            form:{name:'',mail:'',password:'',repassword:''}
                        };
                        res.render('users/changepass',data);
                    }
                    else if(ps == nm){
                        result += '<li>user nameとpasswordは違うものを設定してください</li></ul>';
                        
                        var data ={
                            title:'change password',
                            content:result,
                            form:{name:'',mail:'',password:'',repassword:''}
                        };
                        res.render('users/changepass',data);
                    }else{ // if user found
                        const compared = await bcrypt.compare(mail,rows[0][0].mail);
                        if(compared){
                            const uid = rows[0][0].user_id;
                            connection.query('update User set password = ? where user_id = ? ;',[hps,uid]);
                            var data ={
                                title:'change password',
                                content:'変更できました',
                                form:{name:'',mail:'',password:'',repassword:''}
                            };
                            res.render('users/changepass',data);
                        }else{
                            result += '<li>user nameかmailかpasswordが一致しません</li></ul>';
                            var data ={
                                title:'change password',
                                content:result,
                                form:{name:'',mail:'',password:'',repassword:''}
                            };
                            res.render('users/changepass',data);
                        }
                        
        
                    }  
                }else{
                    result += '<li>user nameかmailかpasswordが一致しません</li></ul>';
                    var data ={
                        title:'change password',
                        content:result,
                        form:{name:'',mail:'',password:'',repassword:''}
                    };
                    res.render('users/changepass',data);
                }
            }else{
                result += '<li>user nameかmailが存在しません</li></ul>';
                    var data ={
                        title:'change password',
                        content:result,
                        form:{name:'',mail:'',password:'',repassword:''}
                    };
                    res.render('users/changepass',data);
            }
            

                    
        });

        
        
    }
});

router.get('/signout', (req, res, next) => {
    if(req.session.uid == undefined){
        res.redirect('/users/signin');
    }else{
        req.session.destroy();
        console.log(req.session);
        var data ={
            title:'signin',
            content:'',
            form:{name:'',password:'',repassword:''}
        };
        res.render('users/signin',data);
    }
    
});

router.get('/delete',(req,res,next)=>{
    if(req.session.uid == undefined){
        res.redirect('/users/signin');
    }else{
        var data ={
            title:'delete my account',
            content:'',
            form:{name:'',mail:'',password:''}
        };
        res.render('users/delete',data);
    }
    
});

router.post('/delete',
    [
        check('name','user name は必ず入力してください').notEmpty().escape(),
        check('mail','mailは必ずメールアドレスを入力してください').notEmpty().isEmail().escape(),
        check('password','password は必ず入力してください').notEmpty().escape(),
    ],async (req,res,next)=>{
    if(req.session.uid == undefined){
        res.redirect('/users/signin');
    }else{
        const errors = validationResult(req);
    
        //const hash = req.body.password;
        if(!errors.isEmpty()){
            var result = '<ul class="text-danger">';
            var result_arr = errors.array();
            for(var i in result_arr){
                result += '<li>' + result_arr[i].msg + '</li>'
            }
            result += '</ul>'
            var data ={
                title:'delete',
                content:result,
                form:{name:'',mail:'',password:''}
            }
            res.render('users/delete',data);
        }else{
            const nm =req.body.name;
            const ps = req.body.password;
            const ml = req.body.mail;
            
            connection.query('SELECT password,user_id,mail FROM User WHERE user_name = ? ;', [nm], async (err, rows, next)=> {
                if(err) throw err;
                
                // if user not found
                if (rows.length <= 0) {
                    var result = '<ul class="text-danger"><li>user nameかpasswordが間違っています </li></ul>';
                    var data ={
                        title:'delete',
                        content:result,
                        form:{name:'',mail:'',password:''}
                    };
                    res.render('users/delete',data);
                }
                else 
                { // if user found
                    const pcompared = await bcrypt.compare(ps,rows[0].password);
                    const mcompared = await bcrypt.compare(ml,rows[0].mail);
                    const uid = req.session.uid;
                    if(pcompared && mcompared){
                        const q1 = 'delete from track where fk_uid = ? ;';
                        const q2 = 'delete from record where fk_uid = ? ;';
                        const q3 = 'delete from todo where fk_uid = ? ;';
                        const q4 = 'delete from memo where fk_uid = ? ;';
                        const q5 = 'delete from book where fk_uid = ? ;';
                        const q6 = 'delete from User where user_id = ? ;';
    
                        connection.query(q1+q2+q3+q4+q5+q6,[uid,uid,uid,uid,uid,uid]);
                            
                        res.redirect('../users/signup');
                        
                        
                    }else{
                        var result = '<ul class="text-danger"><li>user nameかmailかpasswordが間違っています </li></ul>';
                        var data ={
                            title:'delete',
                            content:result,
                            form:{name:'',mail:'',password:''}
                        };
                        res.render('users/delete',data);
                    }
                    
                    
     
                }            
            });
    
            
            
        }
    }
    
});

module.exports = router;