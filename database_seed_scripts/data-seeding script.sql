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




insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'CS1336.001', 'Programming Fundamentals', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'MATH1325.006', 'Applied Calculus I', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'BIOL3361.001', 'Biochemistry I', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'EE2310.001', 'Introduction to Digital Systems', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'MATH1306.001', 'College Algebra for the Non-Scientist', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'CS3305.002', 'Discrete Mathematics for Computing II', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('1', 'CS2305.001', '	Discrete Mathematics for Computing I', '16S');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('2', 'MATH1306.001', 'College Algebra for the Non-Scientist', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('2', 'BIOL3361.001', 'Biochemistry I', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('2', 'CS1336.006', 'Programming Fundamentals', '15F');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('3', 'BIOL3361.001', 'Biochemistry I', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('3', 'MATH1306.002', 'College Algebra for the Non-Scientist', '15S');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('4', 'BIOL3361.001', 'Biochemistry I', '16F');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('5', 'EE2310.001', 'Introduction to Digital Systems', '16F');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('6', 'BIOL3361.001', 'Biochemistry I', '17S');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('6', 'EE2310.001', 'Introduction to Digital Systems', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('6', 'CS3305.002', 'Discrete Mathematics for Computing II', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('6', 'CS2305.001', '	Discrete Mathematics for Computing I', '16S');

insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('7', 'BIOL3361.001', 'Biochemistry I', '16F');
insert into dummy_User_Enrollment (internalUserID, enrolledClass, enrolledClassName, semester) values ('7', 'CS3305.002', 'Discrete Mathematics for Computing II', '16S');






insert into ForSale (iD, seller_InternalUserId, postedDateTime, ISBN, author, price, description, bookCondition, status) 
VALUES (NULL, '1', NOW(), '9780133778816', 'GADDIS', '37.92', 'Light wear, some hilighting', '0', '0');

insert into ForSale (iD, seller_InternalUserId, postedDateTime, ISBN, author, price, description, bookCondition, status) 
VALUES (NULL, '7', NOW(), '9780133778816', 'GADDIS', '999.99', 'Great book! Well worth the price!', '0', '0');


