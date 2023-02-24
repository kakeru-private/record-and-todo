const express = require('express');
const router = express.Router();
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
systemLogger.info("todo start");

router.get('/',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        console.log(uid);
        connection.query('select * from todo where fk_uid = ? order by deadline;',[uid],(err,rows)=>{
            if(!err){
                var data ={
                    title:'todo index',
                    content:rows,
                    len:rows.length,
                    text:''
                };
                res.render('todo/index',data);
            }
        });
    }
    
}); 

router.get('/add',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        console.log(uid);
        var data ={
            title:'todo add',
            content:'新しいtodoを入力:',
            form:{todo:'',subject:'',deadline:''}
        }
        res.render('todo/add',data);
    }
    
});


router.post('/add',
    [
        check('todo','todo は必ず入力してください').notEmpty().escape(),
        check('deadline','deadline は必ず入力してください').notEmpty().escape(),
        
    ],(req,res,next)=>{
    const errors = validationResult(req);
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        if(!errors.isEmpty()){
            var result = '<ul class="text-danger">';
            var result_arr = errors.array();
            for(var i in result_arr){
                result += '<li>' + result_arr[i].msg + '</li>'
            }
            result += '</ul>'
            var data ={
                title:'todo add',
                content:result,
                form:req.body
            }
            res.render('todo/add',data);
        }else{
            const uid = req.session.uid;
            const todo = req.body.todo;
            const subject = req.body.subject;
            const deadline = req.body.deadline;
            
            connection.query('insert into todo (todo,subject,deadline,fk_uid) values ( ? , ? , ? , ? );',[todo,subject,deadline,uid]);
            var redi = '/todo?uid=' + uid;
            res.redirect('/todo');
        }
    }
    
});


router.get('/edit',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const todoid = req.query.todoid;
        const uid = req.session.uid;
        console.log(todoid);
        connection.query('select * from todo where todo_id = ? and fk_uid = ? order by deadline;',[todoid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'todo edit',
                    content:'todoを編集',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('todo/edit',data);
            }
        });
    }
    
});

router.post('/edit',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        console.log(req);
        const uid = req.session.uid;
        const todo_id = req.body.todo_id;
        const todo = req.body.todo;
        const subject = req.body.subject;
        const deadline = req.body.deadline;
            
    
        connection.query('update todo set todo = ?, subject = ?, deadline = ? where todo_id = ? and fk_uid = ? ;',[todo,subject,deadline,todo_id,uid]);
        var redi = '/todo?uid=' + uid;
        res.redirect('/todo');
    }
    
});

/* GET users listing. */

router.get('/delete',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const todoid = req.query.todoid;
        const uid = req.session.uid;
        connection.query('select * from todo where todo_id = ? and fk_uid = ? order by deadline;',[todoid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'todo delete',
                    content:'todoを削除',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('todo/delete',data);
            }
        });
    }
    
});

router.post('/delete',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        const todo_id = req.body.todo_id;
        connection.query('delete from todo where todo_id = ? and fk_uid = ? ',[todo_id,uid]);
        var redi = '/todo?uid=' + uid;
        res.redirect('/todo');
    }
    
});

router.post('/search',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        const word = req.body.search;
        console.log(uid);
        console.log(word);
        if(word != ''){
            connection.query('select * from todo where fk_uid = ? and (todo like ? or subject like ? or deadline like ? ) order by deadline;',[uid,'%'+word+'%','%'+word+'%','%'+word+'%'],(err,rows)=>{
                if(!err){
                    var data ={
                        title:'todo search',
                        content:rows,
                        len:rows.length,
                        word:word,
                    };
                    console.log(rows.length);
                    console.log(rows);
                    res.render('todo/search',data);
                }
            });
        }else{
            var redi = '/todo?uid=' + uid;
            res.redirect('/todo');
        }
    }
    
});

module.exports = router;