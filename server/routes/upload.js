const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
const app = express();

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    // Valida Tipo

    let tiposValidos = ['producto', 'usuario'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son ' + tiposValidos,
            }
        })
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones validas son ' + extensionesValidas,
                ext: extension
            }
        })
    }

    // Cambiar nombre al archivo

    let nombreArchivo = `${ id }-${ new Date().getMilliseconds()}.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        // Aquí imagen cargada

        switch (tipo) {
            case 'producto':
                imagenProducto(id, res, nombreArchivo)
                break;
            case 'usuario':
                imagenUsuario(id, res, nombreArchivo);
                break;
            default:
                break;
        }
    });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioBD) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuario');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioBD) {
            borraArchivo(nombreArchivo, 'usuario');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuario');

        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {

        if (err) {
            borraArchivo(nombreArchivo, 'producto');
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoBD) {
            borraArchivo(nombreArchivo, 'producto');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(productoBD.img, 'producto');

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;