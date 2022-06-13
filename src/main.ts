import './style.css'
import { component, computed, inert, setup, state } from '../lib/Elaine';
import modal from './modal';

const app = document.querySelector<HTMLDivElement>('#app')!

const myState = state({
  text: "Yo",
  visible: true
});

const todos = state([
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

const todo = component({
  name: "todo",
  props: [{
    name: "todo",
    type: Object
  }],
  template: `
  <div>
      <div class="todo-header">
        <h2>@@{todo.title}</h2>
        <button ++click="{@@todo.done : undone(); !@@todo.done : done()}">@@{{@@todo.done : ❌;!@@todo.done: ✅}}</button>
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

const yo = component({
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

const openTodos = computed(() => todos.value.filter(t => !t.done), todos);
const doneTodos = computed(() => todos.value.filter(t => t.done), todos);

const todoTitle = state("");
const todoContent = state("");

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

const addTodoNotPossible = computed(() => !todoTitle.value || !todoContent.value, todoTitle, todoContent);


const done = (todo: any) => {
  todo.done = true;
}

const undone = (todo: any) => {
  todo.done = false;
}

const inertText = inert("This is a inert state.");
const updateInertState = () => {
  inertText.notify();
}

const justReturn = (something: any) => "!!" + something;

const thing = component({
  name: "thing",
  props: [{
    name: "prop",
    type: String
  }],
  template: `<h3 @@for="i in @@a" @@class="{@@isSomething(@@yes,@@yes) : nice}" class="hm">@@{prop}<button ++click="toggleYes">Yes/No</button></h3>`,
  css: `
  .hm {
    color: blue;
  }
  .nice {
    color: green;
  }
  `,
  setup: () => {
    const yes = state(false);
    return {
      state: {
        yes,
        isSomething: (thing: any, thing2: any): boolean => thing == true && thing2 == true,
        toggleYes: () => yes.value = !yes.value,
        a: [1, 2, 3, 4]
      }
    }
  }
})

const instance = setup(app, {
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
    addTodoNotPossible,
    done,
    undone,
    inertText,
    updateInertState,
    justReturn
  },
  components: [
    todo, yo, modal,
    thing
  ]
});
