"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    // static getTodos() {
    //   return this.findAll({ order: [["id", "ASC"]] });
    // }

    static overDue(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toLocaleDateString("en-CA"),
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    static dueToday(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toLocaleDateString("en-CA"),
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static dueLater(userId) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toLocaleDateString("en-CA"),
          },
          userId,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }

    static completedItems(userId) {
      return this.findAll({
        where: {
          completed: true,
          userId,
        },
        order: [["id", "ASC"]],
      });
    }

    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }

    static remove(id, userId) {
      this.destroy({
        where: {
          id,
          userId,
        },
      });
    }

    // markAsCompleted() {
    //   return this.update({ completed: true });
    // }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: {
            args: 5,
            msg: "Title length must greater than 5",
          },
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: {
            msg: "Please enter a valid date",
          },
        },
      },
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
