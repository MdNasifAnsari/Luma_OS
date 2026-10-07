const confirmationTitle = document.querySelector("#confirmation-title");
const cardMessage = document.querySelector("#card-message");
const reservationCard = document.querySelector("#reservation-card");

function isReservation(value) {
    return value !== null
        && typeof value === "object"
        && typeof value.reference === "string"
        && typeof value.name === "string"
        && typeof value.email === "string"
        && typeof value.phone === "string"
        && typeof value.date === "string"
        && typeof value.time === "string"
        && Number.isInteger(value.guests)
        && value.guests > 0
        && typeof value.request === "string";
}

function addDetail(list, label, value, className = "") {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    if (className) {
        description.className = className;
    }
    list.append(term, description);
}

function formatDate(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime())
        ? dateValue
        : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function formatTime(timeValue) {
    const [hours, minutes] = timeValue.split(":").map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return timeValue;
    }
    const date = new Date(2000, 0, 1, hours, minutes);
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

if (
    confirmationTitle instanceof HTMLElement
    && cardMessage instanceof HTMLElement
    && reservationCard instanceof HTMLElement
) {
    try {
        const storedReservation = sessionStorage.getItem("foodieReservation");
        const reservation = storedReservation ? JSON.parse(storedReservation) : null;

        if (!isReservation(reservation)) {
            cardMessage.textContent = "No reservation details were found. Please complete the booking form first.";
        } else {
            confirmationTitle.textContent = `You're booked, ${reservation.name}!`;
            cardMessage.textContent = "Your table reservation is confirmed. Here are the details you submitted.";

            const heading = document.createElement("h2");
            const reference = document.createElement("p");
            const details = document.createElement("dl");
            heading.textContent = "Foodie table reservation";
            reference.className = "reservation-reference";
            reference.textContent = `Confirmation: ${reservation.reference}`;

            addDetail(details, "Name", reservation.name);
            addDetail(details, "Email", reservation.email);
            addDetail(details, "Phone", reservation.phone);
            addDetail(details, "Date", formatDate(reservation.date));
            addDetail(details, "Time", formatTime(reservation.time));
            addDetail(details, "Guests", `${reservation.guests} ${reservation.guests === 1 ? "guest" : "guests"}`);
            if (reservation.request) {
                addDetail(details, "Special request", reservation.request, "reservation-request");
            }

            reservationCard.append(heading, reference, details);
            reservationCard.classList.add("reservation-card--visible");
        }
    } catch (error) {
        console.error("Could not load the reservation confirmation.", error);
        cardMessage.textContent = "We couldn't load your reservation details. Please return to the booking form and try again.";
    }
}
