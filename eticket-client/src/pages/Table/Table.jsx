import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Table = () => {
    const [tickets, setTickets] = useState([]);
    const [isStopDisabled, setIsStopDisabled] = useState(true);
    const notificationAudio = useRef(new Audio("/audio/notification.mp3"));
    const previousDataRef = useRef([]);
    const intervalIdRef = useRef(null); // Ref to store the interval ID
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTickets = () => {
            fetch("http://localhost:8040/tickets")
                .then((res) => res.json())
                .then((data) => {
                    if (!data.success) {
                        console.error(
                            "Puppeteer is not running. Stopping ticket checks."
                        );
                        fetch("http://localhost:8040/stop");
                        toast.error("Server is not running.");
                        navigate("/");
                        return;
                    }

                    if (
                        JSON.stringify(data.tickets) !==
                        JSON.stringify(previousDataRef.current)
                    ) {
                        let shouldPlayAudio = false;

                        data.tickets.forEach((newTicket) => {
                            const matchingOldTicket =
                                previousDataRef.current.find(
                                    (oldTicket) =>
                                        oldTicket.train === newTicket.train &&
                                        oldTicket.class === newTicket.class &&
                                        oldTicket.date === newTicket.date &&
                                        oldTicket.fromTo === newTicket.fromTo
                                );

                            if (!matchingOldTicket) {
                                // A completely new ticket has been added
                                shouldPlayAudio = true;
                            } else {
                                // Check for availability change
                                if (
                                    !matchingOldTicket.available &&
                                    newTicket.available
                                ) {
                                    shouldPlayAudio = true;
                                }

                                // Ignore seat number changes unless seat count increases
                                if (
                                    matchingOldTicket.available &&
                                    newTicket.available &&
                                    newTicket.seat > matchingOldTicket.seat
                                ) {
                                    shouldPlayAudio = true;
                                }

                                if (
                                    matchingOldTicket.available &&
                                    newTicket.available &&
                                    newTicket.seat < matchingOldTicket.seat
                                ) {
                                    shouldPlayAudio = false;
                                }
                            }
                        });

                        console.log({ shouldPlayAudio });

                        if (shouldPlayAudio) {
                            notificationAudio.current.currentTime = 0;
                            notificationAudio.current.play();
                        }
                    }

                    previousDataRef.current = data.tickets;
                    setTickets(data.tickets);
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    fetch("http://localhost:8040/stop");
                    toast.error("Server is not running.");
                    navigate("/");
                });
        };

        // Delay fetching for 10 seconds before starting the interval
        const timeout = setTimeout(() => {
            fetchTickets(); // Fetch immediately after delay
            const interval = setInterval(fetchTickets, 1000); // Fetch every 5 seconds
            intervalIdRef.current = interval; // Store the interval ID
        }, 5000); // 10-second delay before first fetch

        return () => {
            clearTimeout(timeout);
            clearInterval(intervalIdRef.current); // Clear the interval when the component unmounts
        };
    }, [navigate]);

    useEffect(() => {
        toast.info("Scanning for tickets, please wait..");
        const timer = setTimeout(() => {
            setIsStopDisabled(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleTest = () => {
        notificationAudio.current.play();
    };

    const handleStop = () => {
        clearInterval(intervalIdRef.current); // Clear the interval when stop is clicked
        fetch("http://localhost:8040/stop")
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
                navigate("/");
            });
    };

    const handleClear = () => {
        fetch("http://localhost:8040/clear");
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-5 bg-gray-100">
            <div className="flex gap-4 mb-6">
                <button
                    onClick={handleTest}
                    className="px-5 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-900 transition-all cursor-pointer"
                >
                    Test Audio
                </button>
                <button
                    onClick={handleClear}
                    disabled={isStopDisabled}
                    className="px-5 py-2 bg-teal-700 text-white rounded-lg shadow-md hover:bg-teal-900 transition-all cursor-pointer"
                >
                    Clear Unavailable
                </button>
                <button
                    onClick={handleStop}
                    disabled={isStopDisabled}
                    className={`px-5 py-2 rounded-lg shadow-md transition-all cursor-pointer ${
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
                            <th className="p-4 border-b">Status</th>
                            <th className="p-4 border-b">Purchase</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket, index) => {
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
                                    <td
                                        className={`p-4 ${
                                            ticket.available
                                                ? "text-green-700"
                                                : "text-red-800"
                                        }`}
                                    >
                                        {ticket.available
                                            ? "Available"
                                            : "Not available"}
                                    </td>
                                    <td className="p-4">
                                        {ticket.available && (
                                            <a
                                                href={ticket.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-800 transition-all inline-block disabled:bg-green-950"
                                            >
                                                Purchase
                                            </a>
                                        )}
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
