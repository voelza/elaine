import ELAINE from "../../../lib/Elaine";

const table = ELAINE.component({
    name: "myTable",
    template: `
    <table>
        <thead>
            <tr>
                <th @@if="@@withRowNum">
                    N#
                </th>
               <th @@for="header in @@headers">
                    @@{header.label}
               </th>
            </tr>
        </thead>
        <tbody>
        <tr @@for="row in @@rows">
            <td @@if="@@withRowNum">
                @@{_index}
            </td>
            <td @@for="header in @@headers">
                 <template-state 
                    data="getAttribute(@@header.key, @@row)" 
                    key="@@header.key" 
                    label="@@header.label"
                    ></template-state>
                 <column></column>
            </td>
        </tr>
        </tbody>
    </table>
    `,
    css: `
        table {
            border-collapse: collapse;
        }

        td, th {
            border-bottom: 1px solid lightgray;
            padding: 5px;
        }

        th {
            text-transform: capitalize;
        }
    `,
    props: ["items", "headers", "withRowNum"],
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
        name: {
            firstname: "Achim",
            lastname: "Yo"
        },
        age: 30,
        birthdate: new Date("1991-12-09")
    },
    {
        name: {
            firstname: "Achim",
            lastname: "Yo1"
        },
        age: 30,
        birthdate: new Date("1991-12-09")
    },
    {
        name: {
            firstname: "Achim",
            lastname: "Yo2"
        },
        age: 30,
        birthdate: new Date("1991-12-09")
    },
    {
        name: {
            firstname: "Achim",
            lastname: "Yo3"
        },
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
        name: {
            firstname: newRow.value.name,
            lastname: ""
        },
        age: newRow.value.age,
        birthdate: new Date(newRow.value.birthdate)
    });

    newRow.value.name = "";
    newRow.value.age = 1;
    newRow.value.birthdate = "";
}


const headers = ELAINE.state([
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
]);

const getFirstName = (name: any) => {
    return name.firstname;
}

const constant = 1;

ELAINE.setup(document.getElementById("app")!, {
    state: {
        content,
        headers,
        newRow,
        addNewRow,
        getFirstName,
        constant
    },
    components: [table]
});