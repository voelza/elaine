import { computed, setupWithTemplate, state } from "../../../lib/Elaine";
import modal from "./modal";
import todo from "./todo";

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


const instance = setupWithTemplate(
    document.getElementById("app")!,
    document.getElementById("app-template")! as HTMLTemplateElement,
    {
        state: {
            todos,
            openTodos,
            doneTodos,
            todoTitle,
            todoContent,
            addTodo,
            openModal,
            addTodoNotPossible,
            done,
            undone
        },
        components: [
            todo, modal
        ]
    }
);

