/* eslint-disable no-undef */
const request = require("supertest");
const cheerio = require("cheerio");
//const csrf = require("tiny-csrf")
const db = require("../models/index");
const app = require("../app");
let server, agent;

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}



let login = async (agent, username, password) => {
  let res = await agent.get("/login");
  const csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken
  });

}
describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => { });
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });
  test("Sign up for first user", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    res = await agent.post("/users").send({
      firstName: "sowmya",
      lastName: "volladapu",
      email: "sowmya@gmail.com",
      password: "12345678",
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Sign Out for first user", async () => {
    let res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    res = await agent.get("/signout").send({
      _csrf: csrfToken
    })
    expect(res.statusCode).toBe(302);
  });

  test("Sign up for second user", async () => {
    let response = await agent.get("/signup");
    const csrfToken = extractCsrfToken(response);
    response = await agent.post("/users").send({
      firstName: "sony",
      lastName: "volladapu",
      email: "sony@gmail.com",
      password: "12345678",
      _csrf: csrfToken
    })
    expect(response.statusCode).toBe(302);
  })

  

  test("Sign Out for second user", async () => {
    let response = await agent.get("/todos");
    const csrfToken = extractCsrfToken(response);
    response = await agent.get("/signout").send({
      _csrf: csrfToken
    })
    expect(response.statusCode).toBe(302);
  })


  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent = request.agent(server);
    await login(agent, "sowmya@gmail.com", "12345678");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const res1 = await agent.post("/todos").send({
      title: "speaking skills",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(res1.statusCode).toBe(302);
  });

  
  test("Marks a todo with the given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "sowmya@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "speaking skills",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const parsedResponse1 = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(parsedResponse1.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });


  test("Mark a todo as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "sowmya@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "speaking skills",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const parsedResponse1 = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(parsedResponse1.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
        completed: false,
      });
    const UpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(UpdateResponse.completed).toBe(false);
  });

 


  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    var agent = request.agent(server);
    await login(agent, "sowmya@gmail.com", "12345678");
    var res = await agent.get("/todos");
    var csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "speaking skills",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const Todos = await agent.get("/todos").set("Accept", "application/json");
    const parseTodos = JSON.parse(Todos.text);
    const countTodaysTodos = parseTodos.dueToday.length;
    const Todo = parseTodos.dueToday[countTodaysTodos - 1];
    const todoID = Todo.id;

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const rese = await agent
      .delete(`/todos/${todoID}`)
      .send({ _csrf: csrfToken });

    const bool = Boolean(rese.text);
    expect(bool).toBe(true);
  });
});