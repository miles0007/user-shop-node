/* 
% Dependencies
*/
const jwt = require("jsonwebtoken");
const { user, product, cart } = require("./schema/user");
const helper = require("./helpers");

const controls = {}



controls.home = async function(req, res) {
    const token = req.token;
    // const token = res.cookies.token;
    const user = await helper.getUser(token);
    res.render('home', { user: user })
}

controls.register = function(req, res) {
    let userObject = req.body;
    const hashedPassword = helper.hash(userObject.password);
    

    if (hashedPassword) {
        userObject.password = hashedPassword;
        let newUser = new user(userObject);
        newUser.save()
        .then(data => res.status(200).json({'Response':data}))
        .catch(err => res.status(400).json({'Response':err.message}))
    } else {
        res.status(403).json({'ERR Response':'Required Fields are missing or invalid'})
    }

}


controls.login = function(req, res) {
    console.log(req.method)
    if (req.method == 'POST') {
        const username = typeof req.body.username === 'string' && req.body.username.length > 0? req.body.username: false;
        const password = typeof req.body.password === 'string' && req.body.password.length > 0? req.body.password: false;

        if (username && password) {
            const hashPass = helper.hash(password)
            user.findOne({username,password:hashPass}, function(err, data) {
                if (data) {
                    jwt.sign({ data }, process.env.jwtSecret, {expiresIn: '1h'}, async (err, token) => {
                        if (err) res.status(403).json({'ERR Response':'Unable to create signature.'})
                        res.cookie("auth", token, { maxAge: 3600000000 });
                        res.redirect('/')
                    });
                } else {
                    res.status(403).json({'ERR Response':'No data are fetched ERR.'})
                }
            });
        } else {
            res.status(400).json({'ERR Response':'Required Fields are missing or invalid.'})
        }
    }
    if (req.method == 'GET') {
        res.render('login')
    }
    
}


controls.update = function(req, res) {
    const password = typeof req.body.password === 'string' && req.body.password.length > 0? req.body.password : false;
    const firstName = typeof req.body.firstName  === "string" && req.body.firstName.trim().length > 0?req.body.firstName:false;
    const lastName = typeof req.body.lastName  === "string" && req.body.lastName.trim().length > 0?req.body.lastName:false;
    const email = typeof req.body.email === 'string' && req.body.email.endsWith('.com') && req.body.email.indexOf('@') > 0? req.body.email: false;
    
    if (password || firstName || lastName || email) {
        jwt.verify(req.token, process.env.jwtSecret, (err, verifiedData) => {
            if (!err) {
                const tokenObject = {}
                if (firstName) tokenObject.firstName = firstName;
                if (lastName) tokenObject.lastName = lastName;
                if (password) tokenObject.password = helper.hash(password);
                if (email) tokenObject.email = email;

                user.updateOne({ username: verifiedData.data.username}, tokenObject, function(err, data) {
                    console.log(data, verifiedData.data.username);
                    if (!err) {
                        res.status(200).json({'Response':'Updation of data is Sucess'})
                    } else {
                        res.status(403).json({'ERR Response':err})
                    }
                });
            } else {
                res.status(403).json({'ERR Response':'Login authentication failed.'})
            }
        });
    } else {
        res.status(400).json({'ERR Response':'Required Fields are missing or invalid.'})
    }
}


controls.delete = function(req, res) {
    jwt.verify(req.token, process.env.jwtSecret, (err, verifiedData) => {
        user.findOneAndDelete({ username: verifiedData.data.username }, function(err, data) {
            if (!err) {
                res.status(200).json({'Response':'Deletion of Data is Success.',data})
            } else {
                res.status(403).json({ "ERR Response": err });
            }
        });
    });
}



controls.addProduct = function(req, res) {
    let productObject = req.body;


    jwt.verify(req.token, process.env.jwtSecret, (err, verifiedData) => {
        if (!err) {
            const newProduct = new product(productObject);
            newProduct.save()
            .then(data => res.status(200).json(data))
            .catch(err => res.status(400).json(err))
        } else {
            res.status(400).json({'ERR Response':err})
        } 
    });
}



controls.addCart = function(req, res) {
    let productid = req.query.productid

    jwt.verify(req.token, process.env.jwtSecret, (err, verifiedData) => {
        if (!err) {
            product.findOne({id:productid}, async function(err, productData) {
                // if product exists
                try {
                    const thisproduct = await product.findOne({id:productid})
                    console.log("going")
                    console.log(thisproduct);
                } catch(e)  {
                    console.log('here')
                    console.log(e)
                }

                if (!(typeof productData === 'object' && productData == null)) {
                    cart.findOne({user_id:verifiedData.data._id}, function(err, cartData) {
                        // if cart not exists
                        if (typeof cartData === 'object' && cartData == null) {
                            const cartObject = {
                                user_id: verifiedData.data._id, 
                                products: [{
                                    product_id: productData._id,
                                    price: productData.price
                                }]
                            }
                            const newCart = new cart(cartObject)
                            newCart.save(function(err) {
                                if (!err) {
                                    cart.find({})
                                    .populate('user_id')
                                    .populate('products.product_id')
                                    .exec(function(error, data) {
                                        res.status(200).json({'Success':'ADD'})
                                    });
                                } else {
                                    res.status(400).json({'ERR':err})
                                }
                            });
                            
                            
                        } else {
                            const ifProduct = cartData.products.find(item=> item.product_id.toString() == productData._id.toString())
                            // console.log(cartData.products instanceof Array)
                            if (typeof ifProduct !== 'undefined') {
                                console.log(ifProduct)
                                ifProduct.quantity = ++ifProduct.quantity
                                cartData.save(function(err) {
                                    if (!err) {
                                        res.status(200).json({'Response':'Product increamented Successfully.'});
                                    } else {
                                        res.status(403).json({'ERR Response':'Failed to update the cart'})
                                    }
                                });
                            } else {
                                cartData.products.push({
                                    product_id: productData._id,
                                    price: productData.price
                                })
                                cartData.save(function(err) {
                                    if (!err) {
                                        res.status(200).json({'Response':'Product Successfully added to your cart.'})
                                    } else {
                                        res.status(400).json({'ERR Response':err})
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.status(404).json({'ERR Response':'Product was not found for productid'});
                }
            });
        } else {
            res.status(403).json({'ERR Response':'Token authentication failed'})
        }
    });
}


controls.myCart = function(req, res) {
    jwt.verify(req.token, process.env.jwtSecret, (err, verifiedData) => {
        if (!err) {
            cart.findOne({user_id: verifiedData.data._id}, function(err, cartData) {
                if (!(typeof cartData === 'object' && cartData == null)) {
                    res.status(200).json({'Data': cartData})
                } else {
                    res.status(400).json({'Response':'No items in your cart.'})
                }
            }); 
        } else {
            res.status(403).json({'ERR Response':'Token Authentication failed.'})
        }
    });
}

controls.viewCart = async function(req, res) {
    const cartItems = (await cart.findCartItems(req.user._id))
    // console.log(JSON.stringify(cartItems, null, 4))
    // res.send({ Message: "my cart page"})
    res.render('cart', { items: cartItems, req: req })
}


module.exports = controls;