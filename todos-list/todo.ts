import fs from 'fs';

const todosPath = 'todos.json';

type Todo = {
	id: number;
	task: string;
};

function getTodos(): Todo[] {
	if (!fs.existsSync(todosPath)) {
		return [];
	}
	const data = fs.readFileSync(todosPath);
	return JSON.parse(data.toString()) as Todo[];
}

function listTodos(): void {
	const todos: Todo[] = getTodos();
	todos.forEach(todo => console.log(`${todo.id}: ${todo.task}`));
}

function saveTodos(todos: Todo[]): void {
	fs.writeFileSync(todosPath, JSON.stringify(todos));
}

function removeTodo(id: number): void {
	const todos: Todo[] = getTodos();
	const index = todos.findIndex(todo => todo.id === id);
	if (index === -1) {
		console.log(`Could not find todo with id ${id}`);
		return;
	}

	const removedTodo = todos.splice(index, 1)[0];
	saveTodos(todos);
	console.log(`Removed todo ${removedTodo.id}: ${removedTodo.task}`);
}

function addTodo(task: string): void {
	const todos: Todo[] = getTodos();

	const id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
	todos.push({ id, task });
	saveTodos(todos);
	console.log(`Added todo ${id}: ${task}`);
}

function cli(): void {}
