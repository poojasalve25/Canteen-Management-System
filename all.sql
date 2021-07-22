CREATE DEFINER=`root`@`localhost` PROCEDURE `up_wallet`(in user_id int unsigned)
BEGIN
declare j int default 1;
declare cost int default 0;
declare ord_id int default 0;
declare prod_id int default 0;
declare s CURSOR FOR SELECT pid from order_details where o_id = (SELECT MAX(o_id) from orders where uid=user_id);
declare continue handler for not found SET j=0;
set ord_id =(SELECT MAX(o_id) from orders where uid=user_id);
SET cost = (SELECT bill FROM orders where o_id =ord_id);
if((SELECT wallet from users WHERE uid= user_id) >= cost) then
UPDATE users SET wallet = wallet - cost where uid=user_id;	
ELSE
open s;
fetch s into prod_id;
while j = 1 do
update product set stock = stock+1 where pid=prod_id;
fetch s into prod_id;
end while;
close s;

DELETE FROM order_details where o_id = ord_id;
DELETE FROM orders where o_id = ord_id;
END IF;
END

CREATE DEFINER=`root`@`localhost` PROCEDURE `ord_det`(in user_id int unsigned)
begin
declare j int default 1;
declare temp int default 0;
declare prod_id int default 0;
declare ord_id int default 0;
declare s CURSOR FOR SELECT pid from cart where uid=user_id;
declare continue handler for not found SET j=0;
open s;
fetch s into prod_id;
set ord_id =(SELECT MAX(o_id) from orders where uid=user_id);
while j = 1 do
fetch s into prod_id;

set temp =(SELECT mrp FROM product WHERE pid=prod_id);
insert into order_details values(prod_id,1,(SELECT mrp FROM product WHERE pid=prod_id),ord_id);
update orders set bill = bill + temp where o_id = ord_id;
update product set stock = stock-1 where pid = prod_id;

end while;
close s;
end


insert into order_details values((SELECT MAX(o_id) FROM orders where uid=10002),(SELECT pid FROM cart where uid=10002 LIMIT 1),1,0);

DELETE FROM cart WHERE uid=10002 LIMIT 1;



NEW
create table admin(ad_id INT,ad_email VARCHAR(50),passwd VARCHAR(100),ad_name VARCHAR(50));
create table users(uid INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(45),phone_num VARCHAR(10),email VARCHAR(45),passwd VARCHAR(100),wallet INT); 

create table orders(o_id INT AUTO_INCREMENT PRIMARY KEY, Date DATE,bill INT,uid INT,FOREIGN KEY(uid) REFERENCES users(uid));
create table product(pid INT AUTO_INCREMENT PRIMARY KEY,mrp DECIMAL(5,2),cat VARCHAR(10),pname VARCHAR(20),stock INT,del_status INT,image VARCHAR(150),cart INT);
create table order_details (uid INT, pid INT, qty INT, temp_cost INT,o_id INT,FOREIGN KEY(o_id) REFERENCES orders(o_id),FOREIGN KEY(pid) REFERENCES product(pid));
create table cart(uid INT, pid INT, qty INT, FOREIGN KEY(uid) REFERENCES users(uid), FOREIGN KEY(pid) REFERENCES product(pid));
