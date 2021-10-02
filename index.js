//import dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

//global variables
var myApp = express();
myApp.use(bodyParser.urlencoded({ extended: true })); // use  QS- supports nesting, array etc true

//setting path for public folder (js and css files) and views (for html file) 
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname + '/public'));

//defining view engine to be used
myApp.set('view engine', 'ejs');

//connecting to database
mongoose.connect('mongodb://localhost:27017/flowerstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// set up model for order
const Order = mongoose.model('Order', {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    province: String,
    rose: Number,
    roseCost: Number,
    orchid: Number,
    orchidCost: Number,
    lavender: Number,
    lavenderCost: Number,
    lily: Number,
    lilyCost: Number,
    subtotal: Number,
    tax: Number,
    total: Number
});

// validating phone number
var phoneRegex = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/

// function to check a string
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

// customizing validation for phone number
function customPhoneValidation(value) {
    if (!checkRegex(value, phoneRegex)) {
        throw new Error('Phone number is incorrect');
    }
    return true;
}

// creating an object for all the validations
var valid = [
    check('name', 'Name is required').notEmpty(),        // checking name is not empty
    check('address', 'Address is required').notEmpty(),     //checking address is not empty
    check('province', 'Province is required').notEmpty(),   // checking province field is not empty
    check('city', 'City is required').notEmpty(),           // checking city field is not empty
    check('email', 'Email is incorrect').isEmail(),         // checking if emails are in right format
    check('phone', '').custom(customPhoneValidation),       // checking if phone number is in right format
]

// setting up different routes
// setting up homepage
myApp.get('/', function (req, res) {
    res.render('homepage');
})

// setting up phone submission handler
myApp.post('/receipt', valid, function (req, res) {
    const errors = validationResult(req);

    // if errors is not empty, the submit button won't take user to receipt
    if (!errors.isEmpty()) {
        res.render('homepage', {
            errors: errors.array()
        })
    }

    // the information entered by user is correct.. proceeding to calculate receipt amount
    else {
        // getting all inputs from user
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var city = req.body.city;
        var province = req.body.province;
        var orchid = req.body.orchid;
        var rose = req.body.rose;
        var lavender = req.body.lavender;
        var lily = req.body.lily;

        // calculating the cost of each item
        var orchidCost = orchid * 5;
        var roseCost = rose * 5;
        var lavenderCost = lavender * 5
        var lilyCost = lily * 4;

        // total without tax 
        var subtotal = orchidCost + roseCost + lavenderCost + lilyCost;

        // calculating tax
        var tax = subtotal * 0.13;
        // calculating total amount
        var total = subtotal + tax;

        // creating pageData object to pass to receipt page which has all attributes (user inputs and calcuated values)
        var pageData = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            city: city,
            province: province,
            rose: rose,
            roseCost: roseCost,
            orchid: orchid,
            orchidCost: orchidCost,
            lavender: lavender,
            lavenderCost: lavenderCost,
            lily: lily,
            lilyCost: lilyCost,
            subtotal: subtotal,
            tax: tax,
            total: total
        }
        //store the order to the database
        var newOrder = new Order(pageData);
        //saving the order
        newOrder.save().then(function () {
            console.log("new order created");
        })
        // printing pageData object in receipt page
        res.render('receipt', pageData);
    }
})

// setting up author page

myApp.get('/author', function (req, res) {
    res.render('author', {
        name: 'Srishti Parti',
        studentID: '8693901'
    });
})

//setting up all orders page
myApp.get('/allOrders', function (req, res) {
    Order.find({}).exec(function(err,orders){
        res.render('allorders',{orders:orders});
    })
})
//start the server and listen to port 2143
myApp.listen(2143); //http://localhost:2143

//confirmation message
console.log('working...');