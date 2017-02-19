-------------------------------------------------------------------------------
insert into User (netID, internalUserID) values ('wbr071000', 'Will R');
insert into User (netID, internalUserID) values ('dxc122030', 'Daren C');
insert into User (netID, internalUserID) values ('jrr140530', 'Jonathan R');
insert into User (netID, internalUserID) values ('zoe.jones', 'Zoe J');
insert into User (netID, internalUserID) values ('Rhiannon.Kelsey.Savage', 'Kelsey S');
insert into User (netID, internalUserID) values ('xxt150630', 'Xin T');
insert into User (netID, internalUserID) values ('vkj150030', 'Vaidehi J');

-------------------------------------------------------------------------------
insert into dummy_User_Enrollment (internalUserID, class, semester) values ('wbr071000', 'CS1336.001', '17S');
insert into dummy_User_Enrollment (internalUserID, class, semester) values ('wbr071000', 'MATH1325.006', '17S');

insert into dummy_User_Enrollment (internalUserID, class, semester) values ('wbr071000', 'MATH1306.001', '16F');
insert into dummy_User_Enrollment (internalUserID, class, semester) values ('xxt150630', 'EE2310.001', '16F');



-------------------------------------------------------------------------------
INSERT INTO `MySQLDB1`.`ForSale` (`iD`, `sellerInternalUserId`, `postedDateTime`, `ISBN`, `author`, `price`, `description`, `condition`, `status`) 
VALUES (NULL, 'wbr071000', NOW(), '9780133778816', 'GADDIS', '37.92', 'Light wear, some hilighting', '0', '0');

INSERT INTO `MySQLDB1`.`ForSale` (`iD`, `sellerInternalUserId`, `postedDateTime`, `ISBN`, `author`, `price`, `description`, `condition`, `status`) 
VALUES (NULL, 'vkj150030', NOW(), '9780133778816', 'GADDIS', '999.99', 'Great book! Well worth the price!', '0', '0');