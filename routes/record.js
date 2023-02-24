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
systemLogger.info("record start");*/

router.get('/',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        console.log(req.session);
        connection.query('select * from record where fk_uid = ?;',[uid],(err,rows)=>{
            if(!err){
                var data ={
                    title:'record index',
                    content:rows,
                    len:rows.length,
                    text:''
                };
                res.render('record/index',data);
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
            title:'record add',
            content:'新しいレコードを入力:',
            form:{record_num:'',title:'',artist:'',numOfTrack:1,release_date:'',site:''}
        }
        res.render('record/add',data);
    }
    
});


router.post('/add',
    [
        check('title','title は必ず入力してください').notEmpty().escape(),
        check('release_date','release_date は必ず入力してください').notEmpty().escape(),
        check('numOfTrack','numOfTrack は年齢（整数）を入力してください').isInt()
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
                title:'record add',
                content:result,
                form:req.body
            }
            res.render('record/add',data);
        }else{
            const uid = req.session.uid;
            const record_num = req.body.record_num;
            const title = req.body.title;
            const artist = req.body.artist;
            const numOfTrack = req.body.numOfTrack;
            const release_date = req.body.release_date;
            const site = req.body.site;
            connection.query('insert into record (record_num,title,artist,numOfTrack,release_date,fk_uid,site) values ( ? , ? , ? , ? , ? , ? , ? );',[record_num,title,artist,numOfTrack,release_date,uid,site]);
            var redi = '/record?uid=' + uid;
            res.redirect('/record');
        }
    }
    
});


router.get('/edit',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const recid = req.query.rec_id;
        const uid = req.session.uid;
        console.log(recid);
        connection.query('select * from record where record_id = ? and fk_uid = ? ;',[recid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'record edit',
                    content:'レコードを編集',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('record/edit',data);
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
        const record_id = req.body.record_id;
        const record_num = req.body.record_num;
        const title = req.body.title;
        const artist = req.body.artist;
        const numOfTrack = req.body.numOfTrack;
        const release_date = req.body.release_date;
        const site = req.body.site;
    
        connection.query('update record set record_num = ?,title = ?,artist = ?,numOfTrack = ?,release_date = ?,site = ? where record_id = ? and fk_uid = ? ;',[record_num,title,artist,numOfTrack,release_date,site,record_id,uid]);
        var redi = '/record?uid=' + uid;
        res.redirect('/record');
    }
    
});

/* GET users listing. */

router.get('/delete',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const recid = req.query.rec_id;
        const uid = req.session.uid;
        connection.query('select * from record where record_id = ? and fk_uid = ? ;',[recid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'record delete',
                    content:'レコードを削除',
                    db:row[0],
                };
                console.log(row[0]);
                res.render('record/delete',data);
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
        const record_id = req.body.record_id;
        connection.query('delete from track where fk_rid = ? and fk_uid = ? ;',[record_id,uid]);
        connection.query('delete from record where record_id = ? and fk_uid = ? ;',[record_id,uid]);
        var redi = '/record?uid=' + uid;
        res.redirect('/record');
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
            connection.query('select * from record where fk_uid = ? and (record_num like ? or title like ? or artist like ? or release_date like ?);',[uid,'%'+word+'%','%'+word+'%','%'+word+'%','%'+word+'%'],(err,rows)=>{
                if(!err){
                    var data ={
                        title:'record search',
                        content:rows,
                        len:rows.length,
                        word:word,
                    };
                    console.log(rows.length);
                    console.log(rows);
                    res.render('record/search',data);
                }
            });
        }else{
            var redi = '/record?uid=' + uid;
            res.redirect('/record');
        }
    }
    
});

module.exports = router;