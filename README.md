# OnlineGallery-backend

# scope/functionality/features

=> User register and login
=> create bids
=> User participate in bidding and buy paintings
=> User can sell paintings by adding to the List
=> Chat box for communication between buyer and seller
=> Home page to view all paintings that are for bid
=> Profiles for all Users

# Roles

=> Buyer
=> Seller
=> Admin

# User functions

=> Login - login to the page before buying-view the page as public and can check out as guest but need to login before bidding , with email verification
=> Home page -navigation bar, search, filters, recent search,
=> Individual painting page - navigation bar, search, bid now , dev address , item specs and description
=> Checkout - shipping to, payment method, message to seller

# Seller functions

=> To become a seller he has to submit docs-like address proof,identtit proof,account deatils
=> seller can list paintings for biding in details
=> seller can increase their feedback score by buying paintings
=> Can increase the listing limit by upgrading
=> before bidding the painting will be verfied by the admin and given an approximate bid amount
=> seller can specify resever prize (the minimum prize the painting to be sold)

# Admin funcitons

=> Admin should verify users roles
=> Should verify paintings approval for bidding
=> reviews of reports (or disputes)

# Bidding

=> Online bidding

- buyer places painting for auction - here buyer need to verify the painting before auction(title,description,photos)
- user can bid for the painting based on their bidding limit
- user buys x5 times the biding limit ex. if he buys 1000rs he can bid for limit of 1000rs for 5 paintings, he can increase the limit by buying credits.
- once the user won the bid his amount from the credit will be deducted and futher communication (like delivery address,time) is done on website
- if the user need to cancel the bid(if he wins) he has to bare the fee
- // need to work on the deilvery from AOB to users
  => while biding
- in bidding u cannot enter same number twice
- cant enter bid less than running bid
- give free 25 bids and have to pay to increase bids

=> offline bidding

# Api routes

=> User- signin,login,logout,getprofile,listpainting
=> Bid- create,upate,delete,get
=> comments/review- create,upate,delete

# models

User {
\_id: ObjectId,
firstName:String
lastName:String
email: String,
password: String (hashed),
mobileNum:Number,
credit: Number
role: String (Admin, Artist, User)
myBids:[{artworkId}]
// Add fields for authentication tokens, timestamps, etc.
}

address: {
\_id:
user:userid
name:String
}

Artwork {
\_id: ObjectId,
title: String,
description: String,
images: [String] (array of image URLs),
artist: ObjectId (reference to User),
searchTag: [String],(recommend tags for the Artist)
status: String (active, sold),
}

Auction {
\_id: ObjectId,
artist: ObjectId (reference to User),
artwork: ObjectId (reference to Artwork),
isLive: boolean,(Live or regular bidding)
startingBid: Number,
currentBid: Number,
auctionStart: Date,
auctionEnd: Date,
bids: [{
user: ObjectId (reference to User),
bidAmount: Number,
timestamp: Date,
}],
timestamp: Date,
}

Payment{(Alter based on stripe)
\_id: ObjectId,
user: ObjectId (reference to User),
paymentDate:
transactionId:
Amount:
}

Message {
\_id: ObjectId,
sender: ObjectId (reference to User),
receiver: ObjectId (reference to User),
content: String,
timestamp: Date,
isRead: Boolean,
}
// add address modle
Order {
\_id: ObjectId,
buyer: ObjectId (reference to User),
artwork: ObjectId (reference to Artwork),
address:addressId
amount: Number,
status: String (completed, pending),
timestamp: Date,
}
Comments {
\_id: ObjectId,
user: ObjectId (reference to User),
Artwork: ObjectId (reference to Artwork),
description: String,
timestamp: Date,
}
