insert into User (internalUserId, netId, nickname) VALUES (NULL, 'wbr071000', 'Will R');
insert into User (internalUserId, netId, nickname) values (NULL, 'dxc122030', 'Daren C');
insert into User (internalUserId, netId, nickname) values (NULL, 'jrr140530', 'Jonathan R');
insert into User (internalUserId, netId, nickname) values (NULL, 'bwj091020', 'Zoe J');
insert into User (internalUserId, netId, nickname) values (NULL, 'txs124130', 'Kelsey S');
insert into User (internalUserId, netId, nickname) values (NULL, 'xxt150630', 'Xin T');
insert into User (internalUserId, netId, nickname) values (NULL, 'vkj150030', 'Vaidehi J');




insert into condition_type (id, description) values ('0', 'New');
insert into condition_type (id, description) values ('1', 'Used - Like New');
insert into condition_type (id, description) values ('2', 'Used - Very Good');
insert into condition_type (id, description) values ('3', 'Used - Good');
insert into condition_type (id, description) values ('4', 'Used - Acceptable');




insert into forSaleStatus_type (id, description) values ('0', 'For Sale');
insert into forSaleStatus_type (id, description) values ('1', 'On Hold');
insert into forSaleStatus_type (id, description) values ('2', 'Sold');



insert into transactionStatus_type (id, description) values ('0', 'Pending');
insert into transactionStatus_type (id, description) values ('1', 'Completed');
insert into transactionStatus_type (id, description) values ('2', 'Cancelled');




insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('1', 'CS1336.001', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('1', 'MATH1325.006', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('1', 'MATH1306.001', '16F');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('6', 'BIOL3361.001', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('6', 'EE2310.001', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('6', 'CS3305.002', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, semester) values ('6', 'CS2305.001', '16S');






insert into ForSale (iD, seller_InternalUserId, postedDateTime, ISBN, author, price, description, bookCondition, status) 
VALUES (NULL, '1', NOW(), '9780133778816', 'GADDIS', '37.92', 'Light wear, some hilighting', '0', '0');

insert into ForSale (iD, seller_InternalUserId, postedDateTime, ISBN, author, price, description, bookCondition, status) 
VALUES (NULL, '7', NOW(), '9780133778816', 'GADDIS', '999.99', 'Great book! Well worth the price!', '0', '0');


