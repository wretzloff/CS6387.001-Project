-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2017-02-19 14:41:44.639

drop table if exists dummy_User_Enrollment;
drop table if exists Rating;
drop table if exists Transactions;
drop table if exists WishList;
drop table if exists ForSale;
drop table if exists Message;
drop table if exists User_Converation_Assoc;
drop table if exists Conversation;
drop table if exists User;
drop table if exists condition_type;
drop table if exists forSaleStatus_type;
drop table if exists transactionStatus_type;

-- tables
-- Table: Conversation
CREATE TABLE Conversation (
    iD int NOT NULL AUTO_INCREMENT,
    CONSTRAINT Conversation_pk PRIMARY KEY (iD)
);

-- Table: ForSale
CREATE TABLE ForSale (
    iD int NOT NULL AUTO_INCREMENT,
    seller_InternalUserId int NOT NULL,
    postedDateTime timestamp NULL,
    title varchar(255) NOT NULL DEFAULT 'insert title here',
    ISBN varchar(13) NOT NULL,
    author varchar(255) NOT NULL,
    price decimal(6,2) NOT NULL,
    description varchar(255) NOT NULL,
    bookCondition int NOT NULL,
    CONSTRAINT ForSale_pk PRIMARY KEY (iD)
);

-- Table: Message
CREATE TABLE Message (
    iD int NOT NULL AUTO_INCREMENT,
    to_InternalUserId int NOT NULL,
    from_InternalUserId int NOT NULL,
    messageDateTime timestamp NOT NULL,
    messageContent varchar(255) NOT NULL,
    read_unread int NOT NULL,
    conversationId int NOT NULL,
    CONSTRAINT Message_pk PRIMARY KEY (iD)
);

-- Table: Rating
CREATE TABLE Rating (
    iD int NOT NULL AUTO_INCREMENT,
    transactionId int NOT NULL,
    rated_InternalUserId int NOT NULL,
    ratedBy_InternalUserId int NOT NULL,
    rating int NOT NULL,
    comment varchar(255) NOT NULL,
    CONSTRAINT Rating_pk PRIMARY KEY (iD)
);

-- Table: Transactions
CREATE TABLE Transactions (
    iD int NOT NULL AUTO_INCREMENT,
    buyer_InternalUserId int NOT NULL,
    transactionDateTime timestamp NOT NULL,
    status int NOT NULL,
    conversationId int NOT NULL,
    forSaleId int NOT NULL,
    CONSTRAINT Transactions_pk PRIMARY KEY (iD)
);

-- Table: User
CREATE TABLE User (
    internalUserId int NOT NULL AUTO_INCREMENT,
    netId varchar(255) NOT NULL,
    nickname varchar(255) NOT NULL,
    CONSTRAINT User_pk PRIMARY KEY (internalUserId)
) COMMENT 'user is people who has UtDallas email account';

-- Table: User_Converation_Assoc
CREATE TABLE User_Converation_Assoc (
    internalUserId int NOT NULL,
    conversationId int NOT NULL,
    CONSTRAINT User_Converation_Assoc_pk PRIMARY KEY (internalUserId,conversationId)
);

-- Table: WishList
CREATE TABLE WishList (
    iD int NOT NULL AUTO_INCREMENT,
    internalUserId int NOT NULL,
    ISBN varchar(13) NOT NULL,
    author varchar(255) NOT NULL,
    CONSTRAINT WishList_pk PRIMARY KEY (iD)
);

-- Table: condition_type
CREATE TABLE condition_type (
    id int NOT NULL,
    description varchar(255) NOT NULL,
    CONSTRAINT condition_type_pk PRIMARY KEY (id)
) COMMENT 'This table hold a list valid values that can be stored in the condition column of the ForSale table.';

-- Table: dummy_User_Enrollment
CREATE TABLE dummy_User_Enrollment (
    internalUserId int NOT NULL,
    enrolledClass varchar(255) NOT NULL,
    enrolledClassName varchar(255) NOT NULL,
    semester varchar(255) NOT NULL,
    CONSTRAINT dummy_User_Enrollment_pk PRIMARY KEY (internalUserId,enrolledClass)
);

-- Table: transactionStatus_type
CREATE TABLE transactionStatus_type (
    id int NOT NULL,
    description varchar(255) NOT NULL,
    CONSTRAINT transactionStatus_type_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: Conversation_User_Converation_Assoc (table: User_Converation_Assoc)
ALTER TABLE User_Converation_Assoc ADD CONSTRAINT Conversation_User_Converation_Assoc FOREIGN KEY Conversation_User_Converation_Assoc (conversationId)
    REFERENCES Conversation (iD);

-- Reference: ForSale_Transactions (table: Transactions)
ALTER TABLE Transactions ADD CONSTRAINT ForSale_Transactions FOREIGN KEY ForSale_Transactions (forSaleId)
    REFERENCES ForSale (iD);

-- Reference: ForSale_User (table: ForSale)
ALTER TABLE ForSale ADD CONSTRAINT ForSale_User FOREIGN KEY ForSale_User (seller_InternalUserId)
    REFERENCES User (internalUserId);

-- Reference: ForSale_condition_type (table: ForSale)
ALTER TABLE ForSale ADD CONSTRAINT ForSale_condition_type FOREIGN KEY ForSale_condition_type (bookCondition)
    REFERENCES condition_type (id);

-- Reference: Message_Conversation (table: Message)
ALTER TABLE Message ADD CONSTRAINT Message_Conversation FOREIGN KEY Message_Conversation (conversationId)
    REFERENCES Conversation (iD);

-- Reference: Rating_Transactions (table: Rating)
ALTER TABLE Rating ADD CONSTRAINT Rating_Transactions FOREIGN KEY Rating_Transactions (transactionId)
    REFERENCES Transactions (iD);

-- Reference: Transactions_Conversation (table: Transactions)
ALTER TABLE Transactions ADD CONSTRAINT Transactions_Conversation FOREIGN KEY Transactions_Conversation (conversationId)
    REFERENCES Conversation (iD);

-- Reference: Transactions_transactionStatus_type (table: Transactions)
ALTER TABLE Transactions ADD CONSTRAINT Transactions_transactionStatus_type FOREIGN KEY Transactions_transactionStatus_type (status)
    REFERENCES transactionStatus_type (id);

-- Reference: User_Converation_Assoc_User (table: User_Converation_Assoc)
ALTER TABLE User_Converation_Assoc ADD CONSTRAINT User_Converation_Assoc_User FOREIGN KEY User_Converation_Assoc_User (internalUserId)
    REFERENCES User (internalUserId);

-- Reference: WishList_User (table: WishList)
ALTER TABLE WishList ADD CONSTRAINT WishList_User FOREIGN KEY WishList_User (internalUserId)
    REFERENCES User (internalUserId);

-- Reference: dummy_User_Enrollment_User (table: dummy_User_Enrollment)
ALTER TABLE dummy_User_Enrollment ADD CONSTRAINT dummy_User_Enrollment_User FOREIGN KEY dummy_User_Enrollment_User (internalUserId)
    REFERENCES User (internalUserId);

-- End of file.