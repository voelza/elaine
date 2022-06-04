import { computed, setup, state } from "../../../../lib/Elaine";
const flightType = state('one-way flight')
const departureDate = state(dateToString(new Date()))
const returnDate = state(departureDate.value)

const isReturn = computed(() => flightType.value === 'return flight', flightType);

const canBook = computed(
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


setup(document.getElementById("app")!, {
    state: {
        flightType,
        departureDate,
        returnDate,
        isReturn,
        canBook,
        book
    }
});