-------------------------------------------------------------------------------
insert into User (netID, internalUserID) values ('wbr071000', 'Will R');
insert into User (netID, internalUserID) values ('dxc122030', 'Daren C');
insert into User (netID, internalUserID) values ('jrr140530', 'Jonathan R');
insert into User (netID, internalUserID) values ('bwj091020', 'Zoe J');
insert into User (netID, internalUserID) values ('txs124130', 'Kelsey S');
insert into User (netID, internalUserID) values ('xxt150630', 'Xin T');
insert into User (netID, internalUserID) values ('vkj150030', 'Vaidehi J');

-------------------------------------------------------------------------------
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('1', 'CS1336.001', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('1', 'MATH1325.006', '17S');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('1', 'MATH1306.001', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('6', 'EE2310.001', '16F');



-------------------------------------------------------------------------------
INSERT INTO `MySQLDB1`.`ForSale` (`iD`, `seller_InternalUserId`, `postedDateTime`, `ISBN`, `author`, `price`, `description`, `condition`, `status`) 
VALUES (NULL, '1', NOW(), '9780133778816', 'GADDIS', '37.92', 'Light wear, some hilighting', '0', '0');

INSERT INTO `MySQLDB1`.`ForSale` (`iD`, `seller_InternalUserId`, `postedDateTime`, `ISBN`, `author`, `price`, `description`, `condition`, `status`) 
VALUES (NULL, '7', NOW(), '9780133778816', 'GADDIS', '999.99', 'Great book! Well worth the price!', '0', '0');