const express = require('express');
var localStorage = require('localStorage');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const vt = require('../token');
//const { checkUser } = require("../middleware/authMiddlware");

router.get('/', (req, res) => {
    res.send('HELLO WORLD');
});

var user_email;
var user_uid;
var wallet_bal_before;
var wallet_bal_after;
var flag = 0;
// insert

router.get('/register', (req, res) => {
  res.render('register', {title : 'USER - REGISTER'});
})

router.post('/register', async function(req, res) 
{
  const { name, phone_num, email, password } = req.body;
  db.query(`SELECT * from users where email = ?`, [email], async function(err, result) {
      console.log(result);
      if (result.length != 0) {
        console.log('HI');
        res.json({ msg: 'email already registered' });
      } else {
        //Hashing password
        bcrypt.hash(password, 10, (err, hash) => {
          //console.log(hash);
          db.query(
            `INSERT INTO users(name,phone_num,email,passwd) values("${name}","${phone_num}","${email}","${hash}")`,
            (err, data) => {
              console.log(err);
              flag = 1;
              //err ? res.send(err) : res.json({ msg: 'user added' });
            }
          );
        });
      }
    });
    await sleep(6000);
    if(flag == 1)
    res.render('login', {title : 'CANTEEN - LOGIN'});
    else
    res.status(400);

});
// login

router.get('/login', (req, res) => {
        res.status(200).render('login', {title : 'CANTEEN - LOGIN'});
});

router.post('/login', (request, res) => 
{
  let {email,password} = request.body;
  user_email = email;
  db.query(`SELECT * from users where email = ?`,[email], (err, data) => 
  {
    console.log(data);
    if (err) {res.send(err);
    console.log(err);}
    else if (data.length != 0) 
    {
      bcrypt.compare(password, data[0].passwd, function (err, results) 
      {
        console.log(results);
        if (results) 
        {
          jwt.sign({ data }, process.env.jwt_secret, (err, token) => 
          {
            if(err) console.log(err);
            //console.log(token);

            else {
              db.query('SELECT uid FROM users where email = ?', [user_email], (err, results) => 
              {
                user_uid = results[0].uid;
              }); console.log('login successful');
            //localStorage.setItem('email', JSON.stringify(email));            
              res.status(200).redirect('menu')};
          });
        } 
        else 
        {
          res.json({ msg: 'Incorrect password' });
        }
      });
    } 
    else {
      res.json({ msg: 'email doesnt exist' })
      console.log(email);
    }
  });
});



  router.get('/menu', (req, res, next) => {
        db.query(`SELECT * from menu`, async (err,data,fields) => 
        {
          if(err) console.log(error);
          //console.log(data);
          res.render('menu', {title : 'MENU', userData: data, u_id : user_uid});
        }); 
         
    });


router.get('/addtocart/:pid',(req,res) => 
{
  console.log(user_uid);
  const pid = req.params.pid;
  db.query(`INSERT INTO cart(pid,uid,qty) VALUES("${pid}","${user_uid}",1)`,parseInt(pid) ,(err, data) =>
  {
    if (err)
    res.status(404).send(err);
    else {console.log(user_uid);
      db.query(`SELECT * from product where del_status=0`, async (err,data,fields) => {
        if(err) console.log(error);
        console.log(data);
        res.render('menu', {title : 'MENU', userData: data, u_id : user_uid});
      });   
     }
  });

})


router.get('/pastorders', (req, res) =>
{

    db.query(`SELECT * FROM ORDERS WHERE uid = ${user_uid}`, (err, data) => {
      if(err) res.status(404).send(err);
      else
      {
        res.render('pastorders', {title : 'USER - ORDERS', userData: data, u_id : user_uid});
      }
    })
})


// --------------------------------CART---------------------------

router.get('/cart', (req, res) => {
  db.query(`SELECT pid,pname,mrp,image,cat,uid FROM product natural join cart where uid="?"; `,[user_uid], async (err,data,fields) => {
      if(err) console.log(err);
      console.log(data);
      res.render(`cart`, {title : 'CART', userData: data});
    });  
});


router.get('/cart/remove/:pid', (req, res) => {
 let pid = req.params.pid;

 db.query(`delete from cart where uid="${user_uid}" and pid="${pid}" limit 1;`,(err, data) =>
 {
   if (err)
   res.status(404).send(err);
   else {console.log(pid,user_uid);
    console.log('REMOVE');
     db.query(`SELECT pid,pname,mrp,image,cat,uid FROM product natural join cart where uid="?";`,[user_uid], async (err,data,fields) => {
       if(err) console.log(error);
       console.log(data);
       res.render(`cart`, {title : 'CART', userData: data});
     }); 
    }
 })
});

router.get('/cart/empty', (req, res) => {
  db.query(`DELETE FROM cart where uid = "?"`,[user_uid], async (err,data,fields) => {
      if(err) console.log(error);
      console.log(data);
      res.render('cart', {title : 'CART', userData: data});
    }); 

});





router.get('/cart/checkout',async function(req, res)
{
  console.log(1);

  const pid =req.body;
  console.log(user_uid);
  db.query(`SELECT wallet from users where uid = ?`,[user_uid], (err,results) => {
    wallet_bal_before = results[0].wallet;
    console.log('WALLET BALANCE BEFORE');
    console.log(wallet_bal_before);
  });
  db.query(`INSERT INTO orders(uid,Date) values("?",CURDATE());`,[user_uid],(err,res) => 
  {
    if (err) console.log(err);
  });
  db.query(`call ord_det(?);`,[parseInt(user_uid)], (err, results) => 
  {
    
    if (err) console.log(err);
    //else console.log(results);
  });

  db.query('SELECT MAX(o_id) as o_id from orders where uid = ?',[user_uid],(err,results) => 
  {
    if(err) console.log(err);
    else console.log(results);
    console.log(results[0].o_id);
    ord_id = results[0].o_id;
    db.query(`call up_wallet(?)`,[user_uid] ,(err,res) => 
    {
      if(err) console.log(err);
      else 
      {
        db.query(`SELECT wallet from users where uid="?"`,[user_uid], (err, results) => {
          if(err) 
          {
            console.log(results[0].wallet);
            db.query(`DELETE FROM cart where uid = "?"`,[user_uid], (err,result) => {
              if (err) console.log(err);
              
            });
           
            
          }
          else
          {
            db.query(`DELETE FROM cart where uid = "?"`,[user_uid] , (err,result) => {
              wallet_bal_after = results[0].wallet;
              //res.render('checkout_unsucc', {title : 'INSUFFICIENT BALANCE', Bal: results[0].wallet });
            }); 
          //alert('ORDER WAS PLACED');
          //break;
          }
        });
      }
    });
  });
  await sleep(6000);
  console.log(2);
  if(wallet_bal_before > wallet_bal_after)
    res.render('checkout_succ', {title : 'ORDER PLACED', Bal: wallet_bal_after  });
  else 
    res.render('checkout_unsuc',{title : 'ORDER DECLINED', Bal: wallet_bal_before  });
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

module.exports = router;