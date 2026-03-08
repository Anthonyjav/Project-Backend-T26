'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna varianteId
    await queryInterface.addColumn('CarritoItems', 'varianteId', {
      type: Sequelize.INTEGER,
      allowNull: true, // temporalmente
      references: {
        model: 'ProductoVariantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Migrar datos: encontrar varianteId basado en productoId, talla, color
    const items = await queryInterface.sequelize.query(
      'SELECT id, "productoId", talla, color FROM "CarritoItems"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const item of items) {
      const variante = await queryInterface.sequelize.query(
        'SELECT id FROM "ProductoVariantes" WHERE "productoId" = ? AND talla = ? AND color = ? LIMIT 1',
        {
          replacements: [item.productoId, item.talla, item.color],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      if (variante.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE "CarritoItems" SET "varianteId" = ? WHERE id = ?',
          {
            replacements: [variante[0].id, item.id],
            type: Sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // Hacer varianteId not null
    await queryInterface.changeColumn('CarritoItems', 'varianteId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'ProductoVariantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Remover columnas viejas
    await queryInterface.removeColumn('CarritoItems', 'productoId');
    await queryInterface.removeColumn('CarritoItems', 'talla');
    await queryInterface.removeColumn('CarritoItems', 'color');
  },

  async down(queryInterface, Sequelize) {
    // Agregar de vuelta las columnas
    await queryInterface.addColumn('CarritoItems', 'productoId', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('CarritoItems', 'talla', { type: Sequelize.STRING });
    await queryInterface.addColumn('CarritoItems', 'color', { type: Sequelize.STRING });

    // Migrar datos de vuelta
    const items = await queryInterface.sequelize.query(
      'SELECT id, "varianteId" FROM "CarritoItems"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const item of items) {
      const variante = await queryInterface.sequelize.query(
        'SELECT "productoId", talla, color FROM "ProductoVariantes" WHERE id = ?',
        {
          replacements: [item.varianteId],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      if (variante.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE "CarritoItems" SET "productoId" = ?, talla = ?, color = ? WHERE id = ?',
          {
            replacements: [variante[0].productoId, variante[0].talla, variante[0].color, item.id],
            type: Sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // Remover varianteId
    await queryInterface.removeColumn('CarritoItems', 'varianteId');
  }
};
