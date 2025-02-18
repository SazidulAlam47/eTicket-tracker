import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Table = () => {
    const [tickets, setTickets] = useState([]);
    const [isStopDisabled, setIsStopDisabled] = useState(true);
    const notificationAudio = useRef(new Audio("/audio/notification.mp3"));
    const previousDataRef = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = () => {
            fetch("http://localhost:8040/tickets")
                .then((res) => res.json())
                .then((data) => {
                    if (
                        JSON.stringify(data) !==
                            JSON.stringify(previousDataRef.current) &&
                        data.length <= 6
                    ) {
                        console.log("New tickets available");
                        notificationAudio.current.currentTime = 0;
                        notificationAudio.current.play();
                    }
                    previousDataRef.current = data;
                    setTickets(data);
                })
                .catch((error) => {
                    console.error(error);
                    alert("Error fetching data");
                });
        };

        const interval = setInterval(fetchTickets, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsStopDisabled(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleTest = () => {
        notificationAudio.current.play();
    };

    const handleStop = () => {
        fetch("http://localhost:8040/stop")
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
                alert("Error scoping");
            });
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-5 bg-gray-100">
            <div className="flex gap-4 mb-6">
                <button
                    onClick={handleTest}
                    className="px-5 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all"
                >
                    Test Audio
                </button>
                <button
                    onClick={handleStop}
                    disabled={isStopDisabled}
                    className={`px-5 py-2 rounded-lg shadow-md transition-all ${
                        isStopDisabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-700 text-white hover:bg-red-900"
                    }`}
                >
                    Stop Scanning
                </button>
            </div>
            {tickets.length === 0 ? (
                <div className="text-gray-600 text-lg font-semibold mt-5">
                    Tickets are currently not available
                </div>
            ) : (
                <table className="w-4/5 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                    <thead>
                        <tr className="bg-blue-700 text-white text-left uppercase tracking-wide">
                            <th className="p-4 border-b">From-To</th>
                            <th className="p-4 border-b">Train Name</th>
                            <th className="p-4 border-b">Class</th>
                            <th className="p-4 border-b">Date</th>
                            <th className="p-4 border-b">Seats</th>
                            <th className="p-4 border-b">Was available at</th>
                            <th className="p-4 border-b">Purchase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket, index) => {
                            const [day, month, year] = ticket.date.split("-");
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
                                December: "Dec",
                            };
                            const formattedDate = `${day}-${monthAbbreviations[month]}-${year}`;

                            return (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 border-b last:border-b-0"
                                >
                                    <td className="p-4">{ticket.fromTo}</td>
                                    <td className="p-4">{ticket.train}</td>
                                    <td className="p-4">{ticket.class}</td>
                                    <td className="p-4">{ticket.date}</td>
                                    <td className="p-4">{ticket.seat}</td>
                                    <td className="p-4">{ticket.time}</td>
                                    <td className="p-4">
                                        <a
                                            href={`https://eticket.railway.gov.bd/booking/train/search?fromcity=${
                                                ticket.fromTo.split(" - ")[0]
                                            }&tocity=${
                                                ticket.fromTo.split(" - ")[1]
                                            }&doj=${formattedDate}&class=${
                                                ticket.class
                                            }`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-800 transition-all inline-block"
                                        >
                                            Purchase
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Table;
