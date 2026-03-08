'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear la tabla ProductoVariantes
    await queryInterface.createTable('ProductoVariantes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Productos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      talla: {
        type: Sequelize.STRING,
        allowNull: false
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Migrar datos existentes de Productos a ProductoVariantes
    const productos = await queryInterface.sequelize.query(
      'SELECT id, talla, color, cantidad FROM "Productos" WHERE talla IS NOT NULL AND color IS NOT NULL AND cantidad IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (productos.length > 0) {
      const variantes = productos.map(producto => ({
        productoId: producto.id,
        talla: producto.talla,
        color: producto.color,
        cantidad: producto.cantidad,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await queryInterface.bulkInsert('ProductoVariantes', variantes);
    }

    // Remover las columnas color, talla, cantidad de Productos
    await queryInterface.removeColumn('Productos', 'color');
    await queryInterface.removeColumn('Productos', 'talla');
    await queryInterface.removeColumn('Productos', 'cantidad');
  },

  async down(queryInterface, Sequelize) {
    // Agregar de vuelta las columnas a Productos
    await queryInterface.addColumn('Productos', 'color', { type: Sequelize.STRING });
    await queryInterface.addColumn('Productos', 'talla', { type: Sequelize.STRING });
    await queryInterface.addColumn('Productos', 'cantidad', { type: Sequelize.INTEGER });

    // Migrar datos de vuelta (esto es aproximado, ya que múltiples variantes se perderían)
    const variantes = await queryInterface.sequelize.query(
      'SELECT productoId, talla, color, cantidad FROM "ProductoVariantes"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Para simplicidad, solo actualizar el primer variante por producto
    for (const variante of variantes) {
      await queryInterface.sequelize.query(
        'UPDATE "Productos" SET talla = ?, color = ?, cantidad = ? WHERE id = ?',
        {
          replacements: [variante.talla, variante.color, variante.cantidad, variante.productoId],
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Dropear la tabla ProductoVariantes
    await queryInterface.dropTable('ProductoVariantes');
  }
};
