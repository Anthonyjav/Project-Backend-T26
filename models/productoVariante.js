'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductoVariante extends Model {
    static associate(models) {
      ProductoVariante.belongsTo(models.Producto, {
        foreignKey: 'productoId',
        as: 'producto',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  ProductoVariante.init({
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Productos',
        key: 'id'
      }
    },
    talla: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ProductoVariante',
    tableName: 'ProductoVariantes'
  });

  return ProductoVariante;
};