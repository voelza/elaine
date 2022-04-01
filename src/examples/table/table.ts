import Elaine from "../../../lib/Elaine";
import ELAINE from "../../../lib/Elaine";
import State from "../../../lib/states/State";

const table = ELAINE.component({
    name: "myTable",
    template: `
    <table>
        <thead>
            <tr>
                <th @@if="@@withRowNum">#</th>
               <th @@for="header in @@headers">
                    <div class="myTable-header">
                        <span @@if="@@header.label">@@{header.label}</span>
                        <span @@if="!@@header.label">@@{header.key}</span>
                        <span class="sort-arrow-container">
                            <span @@if="@@header.sortStatus == none" ++click="sortItems(@@header)" class="sort-arrow">&harr;</span>
                            <span @@if="@@header.sortStatus == asc"  ++click="sortItems(@@header)" class="sort-arrow">&uarr;</span>
                            <span @@if="@@header.sortStatus == desc" ++click="sortItems(@@header)" class="sort-arrow">&darr;</span>
                        </span>
                    </div>
               </th>
            </tr>
        </thead>
        <tbody>
        <tr @@for="row in @@rows">
            <td @@if="@@withRowNum">
                @@{rowNum(@@_index)}
            </td>
            <td @@for="header in @@headers">
                 <template-state 
                    data="getAttribute(@@header.key, @@row)" 
                    key="@@header.key" 
                    label="@@header.label"
                    ></template-state>
                 <mycolumn variant="@@key"></mycolumn>
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

        .myTable-header {
            text-transform: capitalize;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 15px;
        }

        .sort-arrow {
            display: block;
            width: 10px;
            cursor: pointer;
        }
    `,
    props: [
        {
            name: "items",
            type: Array
        },
        {
            name: "headers",
            type: Array
        },
        {
            name: "withRowNum",
            required: false,
            default: false,
            type: Boolean
        }],
    slots: ["mycolumn"],
    setup: (state) => {
        const headers = state.data.headers;
        headers.value.forEach((element: any) => {
            element.sortStatus = "none";
        });

        let sortHeader: State<any | null> = Elaine.state(null);
        const sortItems = (header: any) => {
            if (header.sortStatus === "none") {
                header.sortStatus = "asc";
                sortHeader.value = header;
            } else if (header.sortStatus === "asc") {
                header.sortStatus = "desc";
                sortHeader.value = header;
            } else {
                header.sortStatus = "none";
                sortHeader.value = null;
            }


            for (const h of headers.value) {
                if (h.key !== header.key) {
                    h.sortStatus = "none";
                }
            }
            headers.notify();
        };

        const items = state.data.items;
        const rows = ELAINE.computed(() => {
            const i = Array.from(items.value);
            if (sortHeader.value !== null) {
                i.sort((a: any, b: any) => {
                    const a1 = a[sortHeader.value.key];
                    const b1 = b[sortHeader.value.key];

                    if (sortHeader.value.sortBy) {
                        return sortHeader.value.sortBy(a1, b1, sortHeader.value.sortStatus);
                    }

                    if (sortHeader.value.sortStatus == "asc") {
                        if (a1 instanceof String) {
                            return a1.localeCompare(b1);
                        }
                        return a1 - b1;
                    } else {
                        if (b1 instanceof String) {
                            return b1.localeCompare(a1);
                        }
                        return b1 - a1;
                    }
                });
            }
            console.log(i);
            return i;
        }, items, sortHeader);

        const getAttribute = (attribute: string, row: any) => {
            if (!row) {
                return;
            }

            const data = row[attribute];
            if (data instanceof Date) {
                return (data as Date).toLocaleDateString();
            }
            return data ?? "";
        };

        const rowNum = (index: number) => index + 1;

        return {
            state: {
                rows,
                getAttribute,
                rowNum,
                sortItems
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
        age: 1,
        birthdate: new Date("1991-12-09"),
        random: "871h28"
    },
    {
        name: {
            firstname: "Achim",
            lastname: "Yo1"
        },
        age: 36,
        birthdate: new Date("1991-12-09"),
        random: "871dasdasqwh28"
    },
    {
        name: {
            firstname: "Achim",
            lastname: "Yo2"
        },
        age: 4,
        birthdate: new Date("1991-12-09"),
        random: "124eqwdads"
    },
    {
        name: {
            firstname: "Achim",
            lastname: "Yo3"
        },
        age: 30,
        birthdate: new Date("1991-12-09"),
        random: "12dascxys"
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
        birthdate: new Date(newRow.value.birthdate),
        random: "asdasdas"
    });

    newRow.value.name = "";
    newRow.value.age = 1;
    newRow.value.birthdate = "";
}


const headers = ELAINE.state([
    {
        label: "My Cool Name",
        key: "name",
        sortBy: (a: any, b: any, sortDirection: string) => {
            console.log(a, b, sortDirection);
            if (sortDirection === "asc") {
                return a.lastname.localeCompare(b.lastname);
            } else {
                return b.lastname.localeCompare(a.lastname);
            }
        }
    },
    {
        label: "age",
        key: "age"
    },
    {
        label: "birthday",
        key: "birthdate"
    },
    {
        key: "yo"
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