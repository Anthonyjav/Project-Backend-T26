'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CarritoItem extends Model {
    static associate(models) {
      CarritoItem.belongsTo(models.Carrito, {
        foreignKey: 'carritoId',
        as: 'carrito',
        onDelete: 'CASCADE'
      });

      CarritoItem.belongsTo(models.ProductoVariante, {
        foreignKey: 'varianteId',
        as: 'variante',
        onDelete: 'CASCADE'
      });
    }
  }

  CarritoItem.init({
    carritoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    varianteId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'CarritoItem',
  });

  return CarritoItem;
};
