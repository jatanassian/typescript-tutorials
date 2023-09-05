import fs from 'fs';

const todosPath = 'todos.json';

interface Todo {
	id: number;
	task: string;
}

/**
 * Gets todos arrays from JSON file
 *
 * @returns {Todo[]} - List of todos
 */
function getTodos(): Todo[] {
	if (!fs.existsSync(todosPath)) {
		return [];
	}
	const data = fs.readFileSync(todosPath);
	return JSON.parse(data.toString()) as Todo[];
}

/**
 * Lists todos in the terminal
 *
 * @returns {void}
 */
function listTodos(): void {
	const todos: Todo[] = getTodos();
	todos.forEach(todo => console.log(`${todo.id}: ${todo.task}`));
}

/**
 * Saves todos in a JSON file
 *
 * @param {Todo[]} todos - List of todos
 * @return {void}
 */
function saveTodos(todos: Todo[]): void {
	fs.writeFileSync(todosPath, JSON.stringify(todos));
}

/**
 * Removes todo from list
 *
 * @param {number} id - Todo ID
 * @return {void}
 */
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

/**
 * Generates an ID and adds todo in the list
 *
 * @param {string} task - Todo description
 * @return {void}
 */
function addTodo(task: string): void {
	const todos: Todo[] = getTodos();

	const id = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
	todos.push({ id, task });
	saveTodos(todos);
	console.log(`Added todo ${id}: ${task}`);
}

/**
 * Outputs error message in the terminal
 *
 * @param {string} command - Command type
 */
function cliInvalidOption(command: string): void {
	console.error(`Invalid number of options for command ${command}`);
}

/**
 * Handle the commands typed by the user in the terminal
 *
 * @return {void}
 */
function cliHandler(): void {
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
				cliInvalidOption('add');
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
				cliInvalidOption('done');
			}
			break;
		case 'list':
			if (options.length === 0) {
				listTodos();
			} else {
				cliInvalidOption('list');
			}
			break;
		default:
			console.error('Invalid command');
	}
}

cliHandler();
