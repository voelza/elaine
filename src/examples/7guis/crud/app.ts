import Elaine from "../../../../lib/Elaine";


const names = Elaine.state(['Emil, Hans', 'Mustermann, Max', 'Tisch, Roman'])
const selected = Elaine.state('')
const prefix = Elaine.state('')
const first = Elaine.state('')
const last = Elaine.state('')

const filteredNames = Elaine.computed(() =>
    names.value.filter((n) =>
        n.toLowerCase().startsWith(prefix.value.toLowerCase())
    ),
    names,
    prefix
)

Elaine.watch(() => {
    [last.value, first.value] = selected.value.split(', ')
}, selected)

function create() {
    if (hasValidInput()) {
        const fullName = `${last.value}, ${first.value}`
        if (!names.value.includes(fullName)) {
            names.value.push(fullName)
            first.value = last.value = ''
        }
    }
}

function update() {
    if (hasValidInput() && selected.value) {
        const i = names.value.indexOf(selected.value)
        names.value[i] = selected.value = `${last.value}, ${first.value}`
        names.notify();
    }
}

function del() {
    if (selected.value) {
        const i = names.value.indexOf(selected.value)
        names.value.splice(i, 1)
        selected.value = '';
        first.value = '';
        last.value = '';
    }
}

function hasValidInput() {
    return first.value.trim() && last.value.trim()
}

Elaine.setup(document.getElementById("app")!, {
    state: {
        filteredNames,
        selected,
        prefix,
        first,
        last,
        create,
        update,
        del
    }
});