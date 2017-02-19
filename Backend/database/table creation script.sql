-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2017-02-19 14:41:44.639

drop table if exists dummy_User_Enrollment;
drop table if exists Rating;
drop table if exists WishList;
drop table if exists ForSale;
drop table if exists Message;
drop table if exists Conversation;
drop table if exists Transactions;
drop table if exists User;

-- tables
-- Table: Conversation
CREATE TABLE Conversation (
    iD int NOT NULL AUTO_INCREMENT,
    recipient1_internalUserId varchar(255) NOT NULL,
    recipient2_internalUserId varchar(255) NOT NULL,
    CONSTRAINT Conversation_pk PRIMARY KEY (iD)
);

-- Table: ForSale
CREATE TABLE ForSale (
    iD int NOT NULL AUTO_INCREMENT,
    sellerInternalUserId varchar(255) NOT NULL,
    postedDateTime timestamp NOT NULL,
    ISBN varchar(13) NOT NULL,
    author varchar(255) NOT NULL,
    price decimal(6,2) NOT NULL,
    description varchar(255) NOT NULL,
    `condition` int NOT NULL,
    status int NOT NULL,
    CONSTRAINT ForSale_pk PRIMARY KEY (iD)
);

-- Table: Message
CREATE TABLE Message (
    iD int NOT NULL AUTO_INCREMENT,
    to_internalUserId int NOT NULL,
    from_internalUserId int NOT NULL,
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
    ratedInternalUserId int NOT NULL,
    ratedByinternalUserId int NOT NULL,
    rating int NOT NULL,
    comment varchar(255) NOT NULL,
    CONSTRAINT Rating_pk PRIMARY KEY (iD)
);

-- Table: Transactions
CREATE TABLE Transactions (
    iD int NOT NULL AUTO_INCREMENT,
    buyerInternalUserId varchar(255) NOT NULL,
    transactionDateTime timestamp NOT NULL,
    status varchar(255) NOT NULL,
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

-- Table: WishList
CREATE TABLE WishList (
    iD int NOT NULL AUTO_INCREMENT,
    internalUserId int NOT NULL,
    ISBN varchar(13) NOT NULL,
    author varchar(255) NOT NULL,
    CONSTRAINT WishList_pk PRIMARY KEY (iD)
);

-- Table: dummy_User_Enrollment
CREATE TABLE dummy_User_Enrollment (
    internalUserId int NOT NULL,
    class varchar(255) NOT NULL,
    semester varchar(255) NOT NULL,
    CONSTRAINT dummy_User_Enrollment_pk PRIMARY KEY (internalUserId,class,semester)
);

-- foreign keys
-- Reference: Conversation_Transactions (table: Conversation)
ALTER TABLE Conversation ADD CONSTRAINT Conversation_Transactions FOREIGN KEY Conversation_Transactions ()
    REFERENCES Transactions ();

-- Reference: Conversation_User (table: Conversation)
ALTER TABLE Conversation ADD CONSTRAINT Conversation_User FOREIGN KEY Conversation_User (recipient1_internalUserId,recipient2_internalUserId)
    REFERENCES User (internalUserId,internalUserId);

-- Reference: ForSale_Transactions (table: ForSale)
ALTER TABLE ForSale ADD CONSTRAINT ForSale_Transactions FOREIGN KEY ForSale_Transactions (iD)
    REFERENCES Transactions (forSaleId);

-- Reference: ForSale_User (table: ForSale)
ALTER TABLE ForSale ADD CONSTRAINT ForSale_User FOREIGN KEY ForSale_User (sellerInternalUserId)
    REFERENCES User (internalUserId);

-- Reference: Message_Conversation (table: Message)
ALTER TABLE Message ADD CONSTRAINT Message_Conversation FOREIGN KEY Message_Conversation (conversationId)
    REFERENCES Conversation (iD);

-- Reference: Rating_Transactions (table: Rating)
ALTER TABLE Rating ADD CONSTRAINT Rating_Transactions FOREIGN KEY Rating_Transactions (transactionId)
    REFERENCES Transactions (iD);

-- Reference: WishList_User (table: WishList)
ALTER TABLE WishList ADD CONSTRAINT WishList_User FOREIGN KEY WishList_User (internalUserId)
    REFERENCES User (internalUserId);

-- Reference: dummy_User_Enrollment_User (table: dummy_User_Enrollment)
ALTER TABLE dummy_User_Enrollment ADD CONSTRAINT dummy_User_Enrollment_User FOREIGN KEY dummy_User_Enrollment_User (internalUserId)
    REFERENCES User (internalUserId);

-- End of file.

