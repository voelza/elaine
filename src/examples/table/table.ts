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
                 @@{getAttribute(@@header.key, @@row)}
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
    setup: (state) => {
        const items = state.data.items;
        const rows = ELAINE.computed(() => items ? items.value : [], items);

        const getAttribute = (attribute: string, row: any) => {
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

const content = [
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
];


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
        ]
    },
    components: [table]
});