const express = require("express");
const app = express();
const Sequelize = require("sequelize");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const Op = Sequelize.Op;
const todo = require("./models/todo");

app.use(bodyParser.json());

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  try {
    // create a todo
    const date = new Date();
    await Todo.addTodo({ title: "Test", dueDate: date, completed: false });

    const todos = await Todo.findAll();
    console.log(todos);
    const d = new Date().toLocaleDateString("en-CA");
    const overdue = await Todo.findAll({
      where: { dueDate: { [Op.lt]: d }, completed: false },
      order: [["id", "ASC"]],
    });
    const overdueComplete = await Todo.findAll({
      where: { dueDate: { [Op.lt]: d }, completed: true },
    });
    const later = await Todo.findAll({
      where: { dueDate: { [Op.gt]: d } },
    });
    const laterComplete = await Todo.findAll({
      where: { dueDate: { [Op.gt]: d }, completed: true },
    });
    const today = await Todo.findAll({
      where: { dueDate: { [Op.eq]: d } },
    });
    const todayComplete = await Todo.findAll({
      where: { dueDate: { [Op.eq]: d }, completed: true },
    });

    app.locals.tasks = todos;
    app.locals.overdue = overdue;
    app.locals.overdueComplete = overdueComplete;
    app.locals.later = later;
    app.locals.laterComplete = laterComplete;
    app.locals.today = today;
    app.locals.todayComplete = todayComplete;

    response.render("index");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  console.log("Looking for Todo with ID: ", request.params.id);
  try {
    const todo = await todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  console.log("Creating new Todo: ", request.body);
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  console.log("We have to update a Todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    const todo = await todo.findByPk(request.params.id);
    todo.delete();
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/", (request, response) => {
  app.locals.tasks = [{ title: "taks 1" }, { title: "task 2" }];
  response.render("index");
});

module.exports = app;
