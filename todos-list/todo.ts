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

function cli(): void {
	const command = process.argv[2];
	const options = process.argv.slice(3);

	switch (command) {
		case '--help':
			console.log('todo add TASK    add todo');
			console.log('todo done ID     complete a todo');
			console.log('todo list        list todo');
			break;
		case 'add':
			if (options.length === 1) {
				addTodo(options[0]);
			} else {
				console.log('Invalid number of options for command "add"');
			}
			break;
		case 'done':
			if (options.length === 1) {
				const id = parseInt(options[0]);
				if (isNaN(id)) {
					console.log('Option must be a number for command "done"');
				} else {
					removeTodo(id);
				}
			} else {
				console.log('Invalid number of options for command "done"');
			}
			break;
		case 'list':
			if (options.length === 0) {
				listTodos();
			} else {
				console.log('Invalid number of options for command "list"');
			}
			break;
		default:
			console.log('Invalid command');
	}
}

cli();
