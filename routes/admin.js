const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const vt = require('../token');
const { route } = require('./user');


var num_users;
var tot_ord;
var total_bill;
router.get('/', (req, res) => {
    res.send('HELLO WORLD');
});
// create product
router.post('/products/edit', (req, res) => 
{
    const {pname,mrp,stock,cat,del_status} = req.body;
    db.query(
        `INSERT INTO product(pname,mrp,stock,cat,del_status) values("${pname}","${mrp}","${stock}","${cat}","${del_status}")`,
        (err, data) => {
          err ? res.send(err) : res.json({ msg: 'product added' });
        }
      );
});


router.get('/userlist', (req, res) => 
{
  db.query(`SELECT * FROM users` , (err,data) => {
    res.status(200).render('userlist', {title : 'CANTEEN ADMIN - USER LIST' ,userData : data}); 
  })
})

router.post('/userlist', (req,res) => {
    let {user_uid,wallet} = req.body;
    console.log(user_uid,wallet);
    db.query(`UPDATE users set wallet = ${wallet} where uid = ${user_uid}` ,(err,results) =>
    {if(err) return console.log(err);
    else res.redirect('userlist');});
})


router.get('/productlist', (req, res) => 
{
  db.query(`SELECT * FROM product` , (err,data) => {
    res.status(200).render('productlist', {title : 'CANTEEN ADMIN - PRODUCT LIST' ,userData : data}); 
  })
})

router.post('/productlist', (req,res) => {
    let {pid,mrp,stock,del_status} = req.body;
    db.query(`UPDATE product set mrp=${mrp},stock=${stock},del_status=${del_status}  where pid = ${pid}` ,(err,results) =>
    {if(err) return console.log(err);
    else res.redirect('productlist');});
})



router.get('/addprod', (req, res) => 
{
    res.status(200).render('addprod', {title : 'CANTEEN ADMIN - ADD PRODUCT' }); 
  })

router.post('/addprod', (req,res) => {
    let {mrp,stock,pname,cat,image} = req.body;
    db.query(`INSERT INTO product(pname,mrp,cat,stock,image) values ("${pname}",${mrp},"${cat}",${stock},"${image}")` ,(err,results) =>
    {if(err) return console.log(err);
    else res.redirect('productlist');});
})




// del product

/*router.delete('/products/edit/:id', (req, res) => 
{
    //const {pid} = req.params.pid;

    db.query(
        `UPDATE product set del_status = "1" where  pid=? ;`,parseInt(req.params.pid),
        (err, data) => {
          err ? res.send(err) : res.json({ msg: 'product deleted' });
        }
      );
});

// edit product
router.put('/products/edit', (req, res) => 
{
    const {pid,pname,mrp,cat,stock,del_status} = req.body;

    db.query(
        `REPLACE INTO product(pid,pname,mrp,stock,cat,del_status) values("${pid}","${pname}","${mrp}","${stock}","${cat}","${del_status}") ;`,
        (err, data) => {
          err ? res.send(err) : res.json({ msg: 'product updated' });
        }
      );
});*/
// admin login


router.get('/login', (req,res) => 
{
    res.status(200).render('admin_login', {title : 'CANTEEN ADMIN - LOGIN'});
});
router.post('/login', (req, res) => 
{
  const { ad_email, password } = req.body;
  console.log(ad_email);
  db.query(`SELECT * from admin where ad_email = ?`, [ad_email], (err, data) => 
  {
    if (err) 
    {
      res.send(err);
      console.log(data);
    }
    else if (data.length != 0) 
    {
      console.log(password);
      console.log(data[0].passwd);
      bcrypt.compare(password, data[0].passwd, function (err, results) 
      {
        console.log(results);
        if (results) 
        {
          jwt.sign({ data }, process.env.jwt_secret, (err, token) => 
          {
              console.log('ADMIN LOGGED IN');
              res.status(200).redirect('admin_dashboard');
 
          });
        } 
        else 
        {
          res.json({ msg: 'Incorrect password' });
        }
      });
    } 
    else 
    {
      res.json({ msg: 'email doesnt exist' });
    }
  });
});

router.get('/admin_dashboard', (req, res) =>
{
  db.query(`SELECT COUNT(uid) as tot_users from users;`,(err,results) => 
  {
      num_users = results[0].tot_users;
  })
  db.query(`SELECT COUNT(o_id) as total_orders from orders;`,(err,results) => 
  {
      tot_ord = results[0].total_orders;
  })            
  db.query(`SELECT SUM(bill) as total from orders;`,(err,results) => 
  {
      total_bill = results[0].total;
  })
  res.render('admin_dashboard', {title :'ADMIN - DASHBOARD',tusers : num_users, torders : tot_ord, tbill : total_bill});

})
// add balance
  router.put('/wallet',(req,res) => {
    const {uid,bal} = req.body;

    db.query(
        `UPDATE users set wallet = wallet + "${bal}"   where  uid=?`,uid,
        (err, data) => {
          err ? res.send(err) : res.json({ msg: 'balance was added successfully' });
        }
      );
  });

// update stock

/*router.put('/product/stock', (req,res) => {
    const {pid, newStock} = req.body; 
    db.query(
        `UPDATE product set stock="${newStock}"   where  pid=?`,parseInt(pid),
        (err, data) => {
          err ? res.send(err) : res.json({ msg: 'stock updated' });
        }
      );
});*/

// admin register

router.post('/register', (req, res) => {
  const {  ad_email, password } = req.body;
  db.query(`SELECT * from admin where ad_email = ?`, [ad_email], function(err, result) {
      console.log(result);
      if (result.length != 0) {
        console.log('HI');
        res.json({ msg: 'email already registered' });
      } 
      else {
        //Hashing password
        bcrypt.hash(password, 10, (err, hash) => {
          console.log(hash);
          db.query(
            `INSERT INTO admin(ad_email,passwd) values("${ad_email}","${hash}")`,
            (err, data) => {
              err ? res.send(err) : res.json({ msg: 'admin added' });
            }
          );
        });
      }
    });
});
module.exports = router;