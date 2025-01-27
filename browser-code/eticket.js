const pcLocalIp = "192.168.10.204"; //change this to your ip

let checked = false;
const getSeats = () => {
    const seats = document.getElementsByClassName("all-seats");
    const seatsArray = [...seats];
    if (seatsArray.length) {
        checked = true;

        const date = document.querySelector(".date_time");
        const dateText = date.innerText;

        const fromTo = document.querySelector(".from_to_location");
        const fromToText = fromTo.innerText;

        seatsArray.forEach(seat => {
            const seatNumber = parseInt(seat.innerText);
            if (seatNumber > 0) {
                const trainNameParent = seat.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                const trainName = trainNameParent.querySelector(".trip-name .trip-left-info h2").innerText;

                const trainClassParent = seat.parentNode.parentNode.parentNode;
                const trainClass = trainClassParent.querySelector(".seat-class-name").innerText;

                const now = new Date();
                const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                const data = {
                    fromTo: fromToText,
                    train: trainName,
                    class: trainClass,
                    date: dateText,
                    seat: seatNumber,
                    time: formattedTime,
                    link: window.location.href
                };
                console.log(data);

                fetch(`http://${pcLocalIp}:8040/ticket`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(data),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data);
                    });
            }
        })
    }

}


const timeDelay = [500, 1000, 5000, 10000, 15000];

timeDelay.forEach((delay) => {
    setTimeout(() => {
        if (!checked) {
            console.log(`Checked after: ${delay / 1000} seconds`);
            getSeats();
        }
    }, delay);
});

setTimeout(() => {
    window.location.reload();
}, 20000);
