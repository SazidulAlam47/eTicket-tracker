const pcLocalIp = "192.168.10.204"; //change this to your ip

const tableBody = document.querySelector('table tbody');
const notificationAudio = document.getElementById('notification');
const alarmAudio = document.getElementById('alarm');

document.getElementById('test').addEventListener('click', () => {
    notificationAudio.play();

});

document.getElementById('pause').addEventListener('click', () => {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
});

let perviousData = [];
setInterval(() => {


    fetch(`http://${pcLocalIp}:8040/ticket`)
        .then(res => res.json())
        .then(data => {
            if (JSON.stringify(data) != JSON.stringify(perviousData) && data.length <= 6) {
                console.log("new tickets available");
                notificationAudio.currentTime = 0;
                notificationAudio.play();
            }
            perviousData = data;

            tableBody.innerHTML = '';
            data.forEach(ticket => {
                const row = document.createElement('tr');

                const [day, month, year] = ticket.date.split("-");

                // if (ticket.train == "UPABAN EXPRESS (740)" && ticket.class == "S_CHAIR") {
                //     alarmAudio.play();
                // }

                const monthAbbreviations = {
                    January: "Jan",
                    February: "Feb",
                    March: "Mar",
                    April: "Apr",
                    May: "May",
                    June: "Jun",
                    July: "Jul",
                    August: "Aug",
                    September: "Sep",
                    October: "Oct",
                    November: "Nov",
                    December: "Dec"
                };

                const formattedDate = `${day}-${monthAbbreviations[month]}-${year}`;

                row.innerHTML = `
                            <td>${ticket.fromTo}</td>
                            <td>${ticket.train}</td>
                            <td>${ticket.class}</td>
                            <td>${ticket.date}</td>
                            <td>${ticket.seat}</td>
                            <td>${ticket.time}</td>
                            <td><a href="https://eticket.railway.gov.bd/booking/train/search?fromcity=${ticket.fromTo.split(" - ")[0]}&tocity=${ticket.fromTo.split(" - ")[1]}&doj=${formattedDate}&class=${ticket.class}" target="_blank">Purchase</a></td>
                        `;
                tableBody.appendChild(row);
            });
        });
}, 500);