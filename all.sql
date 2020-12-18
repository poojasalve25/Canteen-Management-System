


delimiter //
create trigger pt_price
before insert on order_details
for each row
begin
set new.temp_cost = (SELECT mrp FROM product WHERE new.pid=pid)*(new.qty) ;
update orders set bill = bill + (select temp_cost FROM order_details WHERE o_id = (select LAST_INSERT_ID() FROM orders limit 1) );
end //
delimiter ;


delimiter //
create trigger billamt
after insert on order_details
for each row
begin
update orders set bill = bill + (select new.temp_cost FROM order_details WHERE o_id = (select LAST_INSERT_ID() FROM orders limit 1) );
end //
delimiter ;


delimiter //
create trigger up_wallet
after insert on order_details
for each row
begin
update users set wallet = wallet - (select bill from orders where o_id=new.o_id);
end //
delimiter ;

insert into order_details values((SELECT MAX(o_id) FROM orders where uid=10002),(SELECT pid FROM cart where uid=10002 LIMIT 1),1,0);

DELETE FROM cart WHERE uid=10002 LIMIT 1;