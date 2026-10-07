const bookingForm = document.querySelector("#booking-form");

if (bookingForm instanceof HTMLFormElement) {
    const dateInput = bookingForm.elements.namedItem("date");
    const message = document.querySelector("#form-message");

    if (dateInput instanceof HTMLInputElement) {
        const today = new Date();
        const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
            .toISOString()
            .slice(0, 10);
        dateInput.min = localToday;
    }

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!bookingForm.reportValidity()) {
            return;
        }

        const formData = new FormData(bookingForm);
        const reservation = {
            reference: `FD-${Date.now().toString(36).toUpperCase()}`,
            name: String(formData.get("name")).trim(),
            email: String(formData.get("email")).trim(),
            phone: String(formData.get("phone")).trim(),
            date: String(formData.get("date")),
            time: String(formData.get("time")),
            guests: Number(formData.get("guests")),
            request: String(formData.get("request")).trim(),
        };

        try {
            sessionStorage.setItem("foodieReservation", JSON.stringify(reservation));
            window.location.assign("./table_card.html");
        } catch (error) {
            console.error("Could not save the reservation for confirmation.", error);
            if (message instanceof HTMLElement) {
                message.textContent = "We couldn't save your reservation. Please try again.";
            }
        }
    });
}
