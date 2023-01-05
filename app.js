const express = require("express");
const app = express(); 
const { Todo } = require("./models");
const cookieParser = require("cookie-parser");
// const csrf = require("csurf");
const csrf = require("tiny-csrf");
const bodyParser = require("body-parser");
const path = require("path");
const { response } = require("express");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname + "/public")));
// app.use(express.static("public"));

// for csrf token
// app.use(cookieParser("shh! some secret string"));
app.use(cookieParser("Important string"));
app.use(csrf("123456789iamasecret987654321look", ["POST", "PUT", "DELETE"]));

//End-POints
app.get("/", async (req, res) => {
  const allTodos = await Todo.getTodos();
  const overdue = await Todo.overDue();
  const dueLater = await Todo.dueLater();
  const dueToday = await Todo.dueToday();
  const completedItems = await Todo.completedItems();
  if (req.accepts("html")) {
    res.render("index", {
      allTodos,
      overdue,
      dueLater,
      dueToday,
      completedItems,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json({
      overdue,
      dueToday,
      dueLater,
      completedItems,
    });
  }
});

app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.findAll({ order: [["id", "ASC"]] });
    return res.json(todos);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});

app.post("/todos", async (req, res) => {
  console.log("Body : ", req.body);
  try {
    await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      completed: false,
    });
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async (req, res) => {
  console.log(req.body);
  console.log("Todo marks completed : ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updateTodo = await todo.setCompletionStatus(req.body.completed);
    return res.json(updateTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// eslint-disable-next-line no-unused-vars
app.delete("/todos/:id", async (req, res) => {
  console.log("We have to delete a Todo with ID: ", req.params.id);
  const affectedRow = await Todo.destroy({ where: { id: req.params.id } });
  res.send(affectedRow ? true : false);
});

module.exports = app;
