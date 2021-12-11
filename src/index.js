const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(element => element.username === username);

  if (!user) return response.status(404).json({ error: 'User not found' });

  request.user = user;

  return next()
}

function usernameAlreadyExistis(request, response, next) {
  const { username } = request.body;

  const existis = users.find(user => user.username === username);

  if (existis) return response.status(400).json({ error: `Username '${username}' is already being used` });

  return next();
}

function checkExistisUserTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(element => element.id === id);

  if (!todo) return response.status(404).json({ error: 'Todo does not exist' });

  request.todo = todo;
  return next();
}

app.post('/users', usernameAlreadyExistis, (request, response) => {
  const { name, username } = request.body;

  const user = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  
  const todo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistisUserTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistisUserTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistisUserTodo, (request, response) => {
  const { user, todo } = request;

  const todoIndex = user.todos.findIndex(element => element.id === todo.id);
  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;