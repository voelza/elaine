import Elaine from "../../../../lib/Elaine";
const flightType = Elaine.state('one-way flight')
const departureDate = Elaine.state(dateToString(new Date()))
const returnDate = Elaine.state(departureDate.value)

const isReturn = Elaine.computed(() => flightType.value === 'return flight', flightType);

const canBook = Elaine.computed(
    () =>
        !isReturn.value ||
        stringToDate(returnDate.value) > stringToDate(departureDate.value),
    isReturn, returnDate, departureDate
)


function book() {
    alert(
        isReturn.value
            ? `You have booked a return flight leaving on ${departureDate.value} and returning on ${returnDate.value}.`
            : `You have booked a one-way flight leaving on ${departureDate.value}.`
    )
}

function stringToDate(str: any) {
    const [y, m, d] = str.split('-')
    return new Date(+y, m - 1, +d)
}

function dateToString(date: Date) {
    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate())
    )
}

function pad(n: any, s = String(n)) {
    return s.length < 2 ? `0${s}` : s
}


Elaine.setup(document.getElementById("app")!, {
    state: {
        flightType,
        departureDate,
        returnDate,
        isReturn,
        canBook,
        book
    }
});