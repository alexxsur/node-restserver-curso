const express = require('express');

const fs = require('fs');
const path = require('path');

let app = express();

app.get('/imagen/:tipo/:img', (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = `./uploads/${ tipo }/${ tipo }`;

    let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');

    res.sendFile(noImagePath);

})



module.exports = app;