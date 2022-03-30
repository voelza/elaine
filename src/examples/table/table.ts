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
            <td @@for="attr in @@attributes(@@row)">
                @@{getAttribute(@@attr, @@row)}
            </td>
        </tr>
        </tbody>
    </table>
    `,
    css: `
        th {
            text-transform: capitalize;
        }
    `,
    props: ["items"],
    setup: (state) => {
        const items = state.data.items;
        const headers = ELAINE.computed(() => {
            if (!items.value || items.value.length === 0) {
                return [];
            }
            return Array.from(Object.keys(items.value[0])).map(header => {
                return {
                    label: header
                }
            });
        }, items);
        const rows = ELAINE.computed(() => items.value, items);

        const attributes = (row: any) => Object.keys(row);
        const getAttribute = (attribute: string, row: any) => {
            const data = row[attribute];
            if (row[attribute] instanceof Date) {
                return (data as Date).toLocaleDateString();
            }
            return data;
        };
        return {
            state: {
                headers,
                rows,
                attributes,
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
        content
    },
    components: [table]
});