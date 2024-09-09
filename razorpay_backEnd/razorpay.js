const Razorpay = require('razorpay')
const dotenv = require('dotenv')
const express =require('express')
const cors = require('cors')
const app = express()
const crypto = require('crypto');

dotenv.config(); // access env values
app.use(cors()) //allow cors so we can make request from react 
app.use(express.json()) // parse body

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

// API Call for creating the order
app.post('/create-order', async (req, res) => {
    console.log("Create order")
    console.log("body", req.body)
    try {
        const options = {
            amount: req.body.amount, // amount in the smallest currency unit, in our case ( INR ) we will be using paisa ( RS * 100) 
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7), //Unique and random receipt ID
        };

        const order = await razorpay.orders.create(options);
        console.log(order)
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Call for verifying the payment of the order
app.post('/verify-payment', async (req, res) => {
    console.log("Verify order");
    console.log("Request Body:", req.body);

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        console.log("Sign String:", sign);

        const expectedSign = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        console.log("Expected Signature:", expectedSign);
        console.log("Received Signature:", razorpay_signature);

        if (razorpay_signature === expectedSign) {
            console.log("Payment verified successfully");
            res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            console.log("Invalid payment signature");
            res.status(400).json({ error: 'Invalid payment signature' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});



app.listen(3001, console.log(`Server running in  port 3001`))   