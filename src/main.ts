import './style.css'
import Elaine from '../lib/Elaine';
import modal from './modal';

const app = document.querySelector<HTMLDivElement>('#app')!

const myState = Elaine.state({
  text: "Yo",
  visible: true
});

const todos = Elaine.state([
  {
    title: "Aufgabe #1",
    content: "Es wird gut werden.",
    done: false
  },
  {
    title: "Aufgabe #2",
    content: "Mach mal was sinnvolles.",
    done: false
  },
  {
    title: "Aufgabe #3",
    content: "Mach mal was sinnvolles.",
    done: false
  }
]);

const todo = Elaine.component({
  name: "todo",
  props: [{
    name: "todo",
    type: Object
  }],
  template: `
  <div>
      <div class="todo-header">
        <h2>@@{todo.title}</h2>
        <button ++click="{@@todo.done : undone(); !@@todo.done : done()}">@@{{@@todo.done : Undone;!@@todo.done: Done}}</button>
      </div>
      <div ++click="alertTodo(@@todo)">
        @@{todo.content}
      </div>
    </div>
    `,
  css: `
    .todo-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 15px;
    }
    `,
  setup(state) {
    const todo = state.data.todo;
    const done = () => {
      todo.value.done = true;
    }

    const undone = () => {
      todo.value.done = false;
    }

    const alertTodo = (todo: any) => {
      console.log("ey")
      window.alert(todo);
    }
    return {
      state: {
        done,
        undone,
        alertTodo
      }
    }
  }
});

const yo = Elaine.component({
  name: "yo",
  template: `
  <div>yoy oy yo</div>
    `,
  setup: () => {
    console.log("yo setup");
  },
  css: `div {
    font-size: 25px;
  }`
});

const alertMyState = () => {
  window.alert(JSON.stringify(myState.value));
};

const openTodos = Elaine.computed(() => todos.value.filter(t => !t.done), todos);
const doneTodos = Elaine.computed(() => todos.value.filter(t => t.done), todos);

const todoTitle = Elaine.state("");
const todoContent = Elaine.state("");

const addTodo = () => {
  todos.value.push({
    title: todoTitle.value,
    content: todoContent.value,
    done: false
  });
  todoTitle.value = "";
  todoContent.value = "";
  instance.refs.modal.methods.close();
};

const openModal = () => {
  instance.refs.modal.methods.open();
};

const addTodoNotPossible = Elaine.computed(() => !todoTitle.value || !todoContent.value, todoTitle, todoContent);

const instance = Elaine.setup(app, {
  state: {
    myState,
    todos,
    alertMyState,
    openTodos,
    doneTodos,
    todoTitle,
    todoContent,
    addTodo,
    openModal,
    addTodoNotPossible
  },
  components: [
    todo, yo, modal
  ]
});
