import { component } from "../../../lib/Elaine";

export default component({
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