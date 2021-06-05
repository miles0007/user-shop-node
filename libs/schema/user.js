

const mongoose = require('mongoose');
// const ObjectId = mongoose.Schema.ObjectId;

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        min: 10,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

const productSchema = new mongoose.Schema({
    id: Number,
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availablity: {
        type: Array,
        default: []
    }
});



const cartSchema = new mongoose.Schema({
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }, 
    products : [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: Number
    }]
})


const user = mongoose.model("user", userSchema)
const product = mongoose.model("product",productSchema)
const cart = mongoose.model("cart", cartSchema)

module.exports = {
    user: user,
    product: product,
    cart: cart,
}