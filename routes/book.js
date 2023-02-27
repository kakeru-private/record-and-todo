const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const connection  = require('../lib/database');

/*const log4js = require('log4js');
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
systemLogger.info("book start");*/

router.get('/',(req,res,next) =>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        const uid = req.session.uid;
        console.log(uid);
        connection.query('select * from book where fk_uid = ? ;',[uid],(err,rows)=>{
            if(!err){
                var data ={
                    title:'book index',
                    content:rows,
                    len:rows.length,
                    text:''
                };
                res.render('book/index',data);
            }
        });
    }
    
}); 

router.get('/add',(req,res,next)=>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        const uid = req.session.uid;
        var data ={
            title:'book add',
            content:'新しい本情報を入力:',
            form:{/*fk_uid:uid,*/isbn:'',title:'',author:'',publisher:'',release_date:'',site:''}
        }
        res.render('book/add',data);
    }
    
});


router.post('/add',
    [
        check('title','title は必ず入力してください').notEmpty().escape(),
        check('author','author は必ず入力してください').notEmpty().escape(),
        check('release_date','release_date は必ず入力してください').notEmpty().escape(),
        
    ],(req,res,next)=>{
    const errors = validationResult(req);
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        if(!errors.isEmpty()){
            var result = '<ul class="text-danger">';
            var result_arr = errors.array();
            for(var i in result_arr){
                result += '<li>' + result_arr[i].msg + '</li>'
            }
            result += '</ul>'
            var data ={
                title:'book add',
                content:result,
                form:req.body
            }
            res.render('book/add',data);
        }else{
            const uid = req.session.uid;
            const isbn = req.body.isbn;
            const title = req.body.title;
            const author = req.body.author;
            const publisher = req.body.publisher;
            const release_date = req.body.release_date;
            const site = req.body.site;
            connection.query('insert into book (isbn,title,author,publisher,release_date,fk_uid,site) values ( ? , ? , ? , ? , ? , ? , ? );',[isbn,title,author,publisher,release_date,uid,site]);
            res.redirect('/book');
        }
    }
    
});


router.get('/edit',(req,res,next)=>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        const book_id = req.query.book_id;
        const uid = req.session.uid;
        console.log(book_id);
        connection.query('select * from book where book_id = ? and fk_uid = ? ;',[book_id,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'book edit',
                    content:'レコードを編集',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('book/edit',data);
            }
        });
    }
    
});

router.post('/edit',(req,res,next) =>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        console.log(req);
        const uid = req.session.uid;
        const book_id = req.body.book_id;
        const isbn = req.body.isbn;
        const title = req.body.title;
        const author = req.body.author;
        const publisher = req.body.publisher;
        const release_date = req.body.release_date;
        const site = req.body.site;
    
        connection.query('update book set isbn = ?,title = ?,author = ?,publisher = ?,release_date = ?,site = ? where book_id = ? and fk_uid = ? ;',[isbn,title,author,publisher,release_date,site,book_id,uid]);
        res.redirect('/book');
    }
    
});

/* GET users listing. */

router.get('/delete',(req,res,next)=>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        const book_id = req.query.book_id;
        const uid = req.session.uid;
        connection.query('select * from book where book_id = ? and fk_uid = ? ;',[book_id,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'book delete',
                    content:'レコードを削除',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('book/delete',data);
            }
        });
    }
    
});

router.post('/delete',(req,res,next) =>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        const uid = req.session.uid;
        const book_id = req.body.book_id;
        
        connection.query('delete from book where book_id = ? and fk_uid = ? ;',[book_id,uid]);
        res.redirect('/book');
    }
    
});

router.post('/search',(req,res,next) =>{
    if(req.session.uid == undefined){
        res.redirect('/signin');
    }else{
        const uid = req.session.uid;
        const word = req.body.search;
        console.log(uid);
        console.log(word);
        if(word != ''){
            connection.query('select * from book where fk_uid = ? and (isbn like ? or title like ? or author like ? or release_date like ? or site like ? or publisher like ? );',[uid,'%'+word+'%','%'+word+'%','%'+word+'%','%'+word+'%','%'+word+'%','%'+word+'%'],(err,rows)=>{
                if(!err){
                    var data ={
                        title:'book search',
                        content:rows,
                        len:rows.length,
                        word:word,
                    };
                    console.log(rows.length);
                    console.log(rows);
                    res.render('book/search',data);
                }
            });
        }else{
            res.redirect('/book');
        }
    }
    
});

module.exports = router;