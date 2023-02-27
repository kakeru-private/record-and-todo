const express = require('express');
const router = express.Router();
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
systemLogger.info("select start");*/



router.get('/', function(req, res, next) {
  if(req.session.uid == undefined){
    res.redirect('/signin');
  }else{
      console.log(req.session);
      const uid = req.session.uid;
        console.log(uid);
        const q1 = 'select * from todo where fk_uid = ? order by deadline;';
        const q2 = 'select * from memo where fk_uid = ? ;';
        connection.query(q1 + q2,[uid,uid],(err,rows)=>{
            if(!err){
              console.log(rows);
              console.log(rows[0]);
              console.log(rows[1]);
              console.log(rows[0].length);
                var data ={
                    title:'select services',
                    subtitle:'todo list',
                    content:rows,
                    tlen:rows[0].length,
                    mlen:rows[1].length
                    
                };
                res.render('select/index',data);
            }
        });
      /*var data ={
          title:'select services',
          content:''
      };
      res.render('select/index',data);*/
    }
    
});

/*router.get('/book',(req,res,next)=>{
    
    
    var redi = '/book?uid=' + uid;
    res.redirect('/book');
});

router.get('/record',(req,res,next)=>{
    
    
    var redi = '/record?uid=' + uid;
    res.redirect('/record');
});

router.get('/todo',(req,res,next)=>{
    
    
  var redi = '/record?uid=' + uid;
  res.redirect('/todo');
});

router.get('/record',(req,res,next)=>{
    
    
  var redi = '/memo?uid=' + uid;
  res.redirect('/memo');
});
*/
module.exports = router;