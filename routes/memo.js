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
systemLogger.info("memo start");

router.get('/',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        console.log(uid);
        connection.query('select * from memo where fk_uid = ?;',[uid],(err,rows)=>{
            if(!err){
                var data ={
                    title:'memo index',
                    content:rows,
                    len:rows.length,
                    text:''
                };
                res.render('memo/index',data);
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
            title:'memo add',
            content:'新しいmemoを入力:',
            form:{memo:''}
        }
    }
    
    res.render('memo/add',data);
});


router.post('/add',
    [
        check('memo','memo は必ず入力してください').notEmpty().escape(),
        
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
                title:'memo add',
                content:result,
                form:req.body
            }
            res.render('memo/add',data);
        }else{
            const uid = req.session.uid;
            const memo = req.body.memo;
            
            connection.query('insert into memo (memo,update_date,fk_uid) values ( ? ,CURDATE() , ? );',[memo,uid]);
            var redi = '/memo?uid=' + uid;
            res.redirect('/memo');
        }
    }
    
});


router.get('/edit',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const memoid = req.query.memoid;
        const uid = req.session.uid;
        console.log(memoid);
        connection.query('select * from memo where memo_id = ? and fk_uid = ? ;',[memoid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'memo edit',
                    content:'memoを編集',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('memo/edit',data);
            }
        });
    }
    
});

router.post('/edit',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        const memo_id = req.body.memo_id;
        const memo = req.body.memo;
        
            
    
        connection.query('update memo set memo = ? , update_date = CURDATE() where memo_id = ? and fk_uid = ? ;',[memo,memo_id,uid]);
        var redi = '/memo?uid=' + uid;
        res.redirect('/memo');
    }
    
});

/* GET users listing. */

router.get('/delete',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const memoid = req.query.memoid;
        const uid = req.session.uid;
        connection.query('select * from memo where memo_id = ? and fk_uid = ? ;',[memoid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'memo delete',
                    content:'memoを削除',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('memo/delete',data);
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
        const memo_id = req.body.memo_id;
        connection.query('delete from memo where memo_id = ? and fk_uid = ? ;',[memo_id,uid]);
        var redi = '/memo?uid=' + uid;
        res.redirect('/memo');
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
            connection.query('select * from memo where fk_uid = ? and (memo like ? or update_date like ? );',[uid,'%'+word+'%','%'+word+'%'],(err,rows)=>{
                if(!err){
                    var data ={
                        title:'memo search',
                        content:rows,
                        len:rows.length,
                        word:word
                    };
                    console.log(rows.length);
                    console.log(rows);
                    res.render('memo/search',data);
                }
            });
        }else{
            var redi = '/memo?uid=' + uid;
            res.redirect('/memo');
        }
    }
    
    /*var redi = '/record?id=' + id;
    res.redirect(redi);*/
});

module.exports = router;