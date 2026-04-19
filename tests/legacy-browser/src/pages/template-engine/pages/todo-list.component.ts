import { AcElement } from '../core/element.base';

@AcElement({
  selector: '#todo-app',
  template: `
    <div class="todo-app">
      <h1>AC-Frontend Todo List</h1>
      
      <div class="input-group">
        <input type="text" ac:model="newTodoTitle" placeholder="What needs to be done?">
        <button ac:on:click="addTodo()">Add Todo</button>
      </div>

      <div ac:if="todos.length === 0" class="empty-state">
        No todos yet! Add some above.
      </div>

      <ul class="todo-list">
        <li ac:for="let todo of todos" ac:bind:class="todo.completed ? 'completed' : ''">
          <input type="checkbox" ac:model="todo.completed">
          <span ac:style="{ textDecoration: todo.completed ? 'line-through' : 'none' }">
            {{ todo.title | uppercase }}
          </span>
          <button ac:on:click="removeTodo($index)">Delete</button>
        </li>
      </ul>

      <div class="stats">
        Total: {{ todos.length }} | Completed: {{ completedCount }}
      </div>
      
      <button ac:on:click="clearCompleted()">Clear Completed</button>
    </div>
  `
})
export class TodoListComponent {
  public newTodoTitle = '';
  public todos = [
    { title: 'Learn Proxy Reactivity', completed: true },
    { title: 'Build Element-like Framework', completed: false }
  ];

  get completedCount() {
    return this.todos.filter((t: any) => t.completed).length;
  }

  addTodo() {
    if (this.newTodoTitle.trim()) {
      this.todos.push({
        title: this.newTodoTitle,
        completed: false
      });
      this.newTodoTitle = '';
    }
  }

  removeTodo(index: number) {
    this.todos.splice(index, 1);
  }

  clearCompleted() {
    this.todos = this.todos.filter((t: any) => !t.completed);
  }

  onInit() {
    console.log('TodoListComponent initialized');
  }

  onChanges() {
    console.log('TodoListComponent data changed');
  }
}
