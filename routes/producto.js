const express = require('express');
const router = express.Router();
const { Producto, Categoria, ProductoVariante } = require('../models');
const multer = require('multer');
const path = require('path');
const upload = require('../middlewares/upload');
const hasRole = require('../middlewares/hasRole');
const auth = require('../middlewares/auth');


router.post(
  '/',
  auth,
  hasRole('admin', 'employee'),
  upload.array('imagen', 10),
  async (req, res) => {
    try {
      const {
        nombre,
        descripcion,
        precio,
        categoriaId,
        variantes, // array de {talla, color, cantidad}
        composicion,
        info,
        cuidados,
        seleccionado,
        activo,
      } = req.body;

      const imagenes = req.files ? req.files.map(file => file.path) : [];

      const nuevoProducto = await Producto.create({
        nombre,
        descripcion,
        precio,
        imagen: imagenes,
        categoriaId,
        composicion,
        info,
        cuidados,
        seleccionado,
        activo: activo !== undefined ? activo === 'true' : true,
      });

      // Crear variantes si se proporcionan
      if (variantes && Array.isArray(variantes)) {
        const variantesData = variantes.map(v => ({
          productoId: nuevoProducto.id,
          talla: v.talla,
          color: v.color,
          cantidad: v.cantidad
        }));
        await ProductoVariante.bulkCreate(variantesData);
      }

      // Obtener el producto con variantes
      const productoConVariantes = await Producto.findByPk(nuevoProducto.id, {
        include: [
          { model: Categoria, as: 'categoria' },
          { model: ProductoVariante, as: 'variantes' }
        ]
      });

      res.status(201).json(productoConVariantes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
);


router.get('/', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria' },
        { model: ProductoVariante, as: 'variantes' }
      ]
    });

    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get('/seleccionados', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { seleccionado: true },
      include: [
        { model: Categoria, as: 'categoria' },
        { model: ProductoVariante, as: 'variantes' }
      ]
    });

    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        { model: ProductoVariante, as: 'variantes' }
      ]
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Editar Producto
router.put(
  '/:id',
  auth,
  hasRole('admin', 'employee'),
  upload.array('imagen', 10),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      const {
        nombre,
        descripcion,
        precio,
        categoriaId,
        variantes, // array de {talla, color, cantidad}
        composicion,
        info,
        cuidados,
        seleccionado,
        activo,
      } = req.body;

      const nuevasImagenes =
        req.files && req.files.length > 0
          ? req.files.map(file => file.path)
          : producto.imagen;

      await producto.update({
        nombre,
        descripcion,
        precio,
        imagen: nuevasImagenes,
        categoriaId,
        composicion,
        info,
        cuidados,
        seleccionado,
        ...(activo !== undefined && { activo: activo === 'true' }),
      });

      // Actualizar variantes: eliminar existentes y crear nuevas
      if (variantes && Array.isArray(variantes)) {
        await ProductoVariante.destroy({ where: { productoId: req.params.id } });
        const variantesData = variantes.map(v => ({
          productoId: req.params.id,
          talla: v.talla,
          color: v.color,
          cantidad: v.cantidad
        }));
        await ProductoVariante.bulkCreate(variantesData);
      }

      // Obtener el producto actualizado con variantes
      const productoActualizado = await Producto.findByPk(req.params.id, {
        include: [
          { model: Categoria, as: 'categoria' },
          { model: ProductoVariante, as: 'variantes' }
        ]
      });

      res.json(productoActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  }
);


//Eliminar Producto 
router.delete(
  '/:id',
  auth,
  hasRole('admin'),
  async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      await producto.destroy();
      res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  }
);


module.exports = router;
