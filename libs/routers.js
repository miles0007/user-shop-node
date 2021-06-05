'use strict'

const express = require('express');
const controls = require('./controllers');
const verifyToken = require('./helpers').verifyToken;
const getToken = require('./helpers').getToken;

const router = express.Router();


router.get('/', controls.home)
router.post('/api/create/', controls.register)
router.post('/api/login/',controls.login)
router.patch("/api/user/update/", verifyToken, controls.update);
router.delete("/api/user/delete/", verifyToken, controls.delete);

router.post('/api/insertproduct/', verifyToken, controls.addProduct);


router.get('/api/tocart/', verifyToken, controls.addCart);
router.get('/api/mycart', getToken, verifyToken, controls.myCart);


module.exports = router;
