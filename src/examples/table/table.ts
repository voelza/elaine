import ELAINE from "../../../lib/Elaine";

const table = ELAINE.component({
    name: "myTable",
    template: `
    <table>
        <thead>
            <tr>
               <th @@for="header in @@headers">
                    @@{header.label}
               </th>
            </tr>
        </thead>
        <tbody>
        <tr @@for="row in @@rows">
            <td @@for="header in @@headers">
                 <template-state 
                    data="getAttribute(@@header.key, @@row)" 
                    key="@@header.key" 
                    label="@@header.label" 
                    one="@@1"
                    ></template-state>
                 <column></column>
            </td>
        </tr>
        </tbody>
    </table>
    `,
    css: `
        td, th {
            border: 1px solid black;
            padding: 5px;
        }

        th {
            text-transform: capitalize;
        }
    `,
    props: ["items", "headers"],
    slots: ["column"],
    setup: (state) => {
        const items = state.data.items;
        const rows = ELAINE.computed(() => items ? items.value : [], items);

        const getAttribute = (attribute: string, row: any) => {
            if (!row) {
                return;
            }

            const data = row[attribute];
            if (data instanceof Date) {
                return (data as Date).toLocaleDateString();
            }
            return data;
        };

        return {
            state: {
                rows,
                getAttribute
            }
        }
    }
});

const content = ELAINE.state([
    {
        name: "Achim",
        age: 30,
        birthdate: new Date("1991-12-09")
    },
    {
        name: "Achim",
        age: 30,
        birthdate: new Date("1991-12-09")
    },
    {
        name: "Achim",
        age: 30,
        birthdate: new Date("1991-12-09")
    },
    {
        name: "Achim",
        age: 30,
        birthdate: new Date("1991-12-09")
    },
]);

const newRow = ELAINE.state({
    name: "",
    age: 1,
    birthdate: ""
});

const addNewRow = () => {
    content.value.push({
        name: newRow.value.name,
        age: newRow.value.age,
        birthdate: new Date(newRow.value.birthdate)
    });

    newRow.value.name = "";
    newRow.value.age = 1;
    newRow.value.birthdate = "";
}

ELAINE.setup(document.getElementById("app")!, {
    state: {
        content,
        headers: [
            {
                label: "My Cool Name",
                key: "name"
            },
            {
                label: "age",
                key: "age"
            },
            {
                label: "birthday",
                key: "birthdate"
            }
        ],
        newRow,
        addNewRow
    },
    components: [table]
});