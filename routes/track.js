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
systemLogger.info("track start");*/

router.get('/',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        const rec_id = req.query.rec_id;
    
        if(!rec_id){
            
            connection.query('select record.title,track.track_id,track.tTitle,track.fk_rid,track.fk_uid,track.artist from track left join record on track.fk_rid = record.record_id where track.fk_uid = ?;',[uid],(err,rows)=>{
                //console.log(rows.length);
                if(!err){
                    var data ={
                        title:'all tracks',
                        content:rows,
                        len:rows.length,
                        text:''
                    };
                    res.render('record/track/index',data);
                }
            });
        }else{
            var q1 = 'select record.title,track.track_id,track.tTitle,track.fk_rid,track.fk_uid,track.artist from track left join record on track.fk_rid = record.record_id where track.fk_rid = ? and track.fk_uid = ?;'
            var q2 = 'select title from record where record_id = ?;'
            connection.query(q1+q2,[rec_id,uid,rec_id],(err,rows)=>{
                console.log(rows[0]);
                if(!err){
                    var data ={
                        title:'track index',
                        content:rows,
                        len:rows[0].length,
                        rec_id:rec_id,
                        text:''
                    };
                    res.render('record/track/recindex',data);
                }
            });
        }
    }
    
    
}); 

router.get('/add',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        const rec_id = req.query.rec_id;
        const rectitle = req.query.rectitle;
        console.log(rectitle);
        var data ={
            title:'track add',
            content:rectitle + 'に曲を追加',
            alert:'',
            form:{title:'',artsist:'',fk_rid:rec_id}
        }
        res.render('record/track/add',data);
    }
    
});


router.post('/add',
    [
        check('title','title は必ず入力してください').notEmpty().escape(),
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
                title:'track add',
                content:req.body.content,
                alert:result,
                form:req.body
            }
            res.render('record/track/add',data);
        }else{
            const uid = req.session.uid;
            const rec_id = req.body.fk_rid;
            const title = req.body.title;
            const artist = req.body.artist;
            
            connection.query('insert into track (tTitle,artist,fk_uid,fk_rid) values ( ? , ? , ? , ? );',[title,artist,uid,rec_id]);
            var redi = '/record/track?rec_id=' + rec_id;
            res.redirect(redi);
        }
    }
    
});


router.get('/edit',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        //console.log(req);
        const trackid = req.query.trackid;
        //console.log(req.query);
        const rec_id = req.query.rec_id;
        const uid = req.session.uid;
        //console.log(trackid);
        connection.query('select * from track where track_id = ? and fk_uid = ? ;',[trackid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'track edit',
                    content:'トラックを編集',
                    db:row[0],
                    rec_id:rec_id
                    //rectitle:rectitle
                
                };
                res.render('record/track/edit',data);
            }
        });
    }
    
    
});

router.post('/edit',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        //console.log(req);
        const uid = req.session.uid;
        const track_id = req.body.track_id;
        const record_id = req.body.rec_id;
        const title = req.body.title;
        const artist = req.body.artist;
        // const rectitle = req.body.rectitle;

        connection.query('update track set tTitle = ?,artist = ? where track_id = ? and fk_uid = ? ;',[title,artist,track_id,uid]);
        if(!record_id){
            var redi = '/record/track?rec_id=' + record_id;
            res.redirect('/record/track');
        }else{
            var redi = '/record/track?rec_id=' + record_id;
            res.redirect(redi);
        }
    }
    
    
});

/* GET users listing. */

router.get('/delete',(req,res,next)=>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const trackid = req.query.trackid;
        const rec_id = req.query.rec_id;
        const uid = req.session.uid;
        //const rectitle=req.query.rectitle;
        connection.query('select * from track where track_id = ? and fk_uid = ? ;',[trackid,uid],(err,row)=>{
            if(!err){
                var data ={
                    title:'track delete',
                    content:'トラックを削除',
                    db:row[0],
                    rec_id:rec_id
                    //rectitle:rectitle
                };
                console.log(row[0]);
                res.render('record/track/delete',data);
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
        const record_id = req.body.rec_id;
        //const rectitle = req.body.rectitle;
        const track_id  = req.body.track_id;
        connection.query('delete from track where track_id = ?  and fk_uid = ? ;',[track_id,uid]);
        if(!record_id){
            var redi = '/record/track?rec_id=' + record_id;
            res.redirect('/record/track');
        }else{
            var redi = '/record/track?rec_id=' + record_id;
            res.redirect(redi);
        }
    }
    
});

router.post('/search',(req,res,next) =>{
    if(req.session.uid == undefined){
        console.log(req.session);
        res.redirect('users/signin');
    }else{
        const uid = req.session.uid;
        const rec_id = req.body.rec_id;
        const word = req.body.search;
        console.log(uid);
        console.log(word);
        console.log(rec_id);
        if(word != ''){
            if(!rec_id){
                connection.query('select record.title,track.track_id,track.tTitle,track.fk_rid,track.fk_uid,track.artist from track left join record on track.fk_rid = record.record_id  where track.fk_uid = ? and (track.tTitle like ? or track.artist like ?);',[uid,'%'+word+'%','%'+word+'%'],(err,rows)=>{
                    if(!err){
                        var data ={
                            title:'track search',
                            content:rows,
                            len:rows.length,
                            word:word,
                        };
                        console.log(rows.length);
                        console.log(rows);
                        res.render('record/track/search',data);
                    }
                });
            }else{
                connection.query('select record.title,track.track_id,track.tTitle,track.fk_rid,track.fk_uid,track.artist from track left join record on track.fk_rid = record.record_id  where track.fk_uid = ? and track.fk_rid = ? and (track.tTitle like ? or track.artist like ?);',[uid,rec_id,'%'+word+'%','%'+word+'%'],(err,rows)=>{
                    if(!err){
                        var data ={
                            title:'track search',
                            content:rows,
                            len:rows.length,
                            word:word,
                            rec_id:rec_id
                        };
                        console.log(rows.length);
                        console.log(rows);
                        res.render('record/track/tracksearch',data);
                    }
                });
            }
            
        }else{
            var redi = '/record/track?uid=' + uid;
            res.redirect('/record/track');
        }
        /*var redi = '/record?id=' + id;
        res.redirect(redi);*/
    }
    
});

module.exports = router;