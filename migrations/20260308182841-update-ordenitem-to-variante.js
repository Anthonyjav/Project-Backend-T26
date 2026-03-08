'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna varianteId
    await queryInterface.addColumn('OrdenItems', 'varianteId', {
      type: Sequelize.INTEGER,
      allowNull: true, // temporalmente
      references: {
        model: 'ProductoVariantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Migrar datos: encontrar varianteId basado en productoId, talla
    const items = await queryInterface.sequelize.query(
      'SELECT id, "productoId", talla FROM "OrdenItems"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const item of items) {
      const variante = await queryInterface.sequelize.query(
        'SELECT id FROM "ProductoVariantes" WHERE "productoId" = ? AND talla = ? LIMIT 1',
        {
          replacements: [item.productoId, item.talla],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      if (variante.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE "OrdenItems" SET "varianteId" = ? WHERE id = ?',
          {
            replacements: [variante[0].id, item.id],
            type: Sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // Hacer varianteId not null
    await queryInterface.changeColumn('OrdenItems', 'varianteId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'ProductoVariantes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Remover columnas viejas
    await queryInterface.removeColumn('OrdenItems', 'productoId');
    await queryInterface.removeColumn('OrdenItems', 'talla');
  },

  async down(queryInterface, Sequelize) {
    // Agregar de vuelta las columnas
    await queryInterface.addColumn('OrdenItems', 'productoId', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('OrdenItems', 'talla', { type: Sequelize.STRING });

    // Migrar datos de vuelta
    const items = await queryInterface.sequelize.query(
      'SELECT id, "varianteId" FROM "OrdenItems"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const item of items) {
      const variante = await queryInterface.sequelize.query(
        'SELECT "productoId", talla FROM "ProductoVariantes" WHERE id = ?',
        {
          replacements: [item.varianteId],
          type: Sequelize.QueryTypes.SELECT
        }
      );
      if (variante.length > 0) {
        await queryInterface.sequelize.query(
          'UPDATE "OrdenItems" SET "productoId" = ?, talla = ? WHERE id = ?',
          {
            replacements: [variante[0].productoId, variante[0].talla, item.id],
            type: Sequelize.QueryTypes.UPDATE
          }
        );
      }
    }

    // Remover varianteId
    await queryInterface.removeColumn('OrdenItems', 'varianteId');
  }
};
