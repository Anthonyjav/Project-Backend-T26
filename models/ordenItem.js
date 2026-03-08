'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrdenItem extends Model {
    static associate(models) {
      // Relación con la tabla Orden (Ordens)
      OrdenItem.belongsTo(models.Orden, {
        foreignKey: 'ordenId',
        as: 'orden',
        onDelete: 'CASCADE'
      });

      // Relación con la tabla ProductoVariante
      OrdenItem.belongsTo(models.ProductoVariante, {
        foreignKey: 'varianteId',
        as: 'variante',
        onDelete: 'SET NULL'
      });
    }
  }

  OrdenItem.init({
    ordenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    varianteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    nombreProducto: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OrdenItem',
    tableName: 'ordenitems', // <- asegúrate que coincida con tu tabla en la DB
    freezeTableName: true
  });

  return OrdenItem;
};
