import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [scanCount, setScanCount] = useState("");
    const [scans, setScans] = useState([]);
    const navigate = useNavigate();

    const generateInputs = () => {
        const count = parseInt(scanCount, 10);
        if (isNaN(count) || count < 1) {
            alert("Please enter a valid number of scans.");
            return;
        }
        setScans(
            Array.from({ length: count }, (_, i) => ({
                id: i + 1,
                from: "",
                to: "",
                date: "",
            }))
        );
    };

    const handleChange = (index, field, value) => {
        const updatedScans = [...scans];
        updatedScans[index][field] = value;
        setScans(updatedScans);
    };

    const sendData = () => {
        if (scans.some((scan) => !scan.from || !scan.to || !scan.date)) {
            alert("Please fill out all fields.");
            return;
        }

        fetch("http://localhost:8040/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scans),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    navigate("/table");
                }
            })
            .catch((error) => {
                alert("Can not connect to server");
                console.error("Error:", error);
            });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white p-5">
            <div className="w-4/5 max-w-4xl bg-white p-10 rounded-xl shadow-xl border border-gray-200">
                <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
                    E-Ticket Input Form
                </h1>
                <div className="mb-6">
                    <label className="block text-gray-600 text-lg mb-2">
                        Number of Scans:
                    </label>
                    <input
                        type="number"
                        value={scanCount}
                        onChange={(e) => setScanCount(e.target.value)}
                        placeholder="Enter number of scans"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={generateInputs}
                        className="mt-4 w-full px-4 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                    >
                        Generate
                    </button>
                </div>
                <div>
                    {scans.map((scan, index) => (
                        <div
                            key={scan.id}
                            className="bg-gray-50 p-6 mb-6 rounded-lg shadow-md border border-gray-300"
                        >
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                Scan {scan.id}
                            </h3>
                            <label className="block text-gray-600 mb-1">
                                From:
                            </label>
                            <input
                                type="text"
                                value={scan.from}
                                onChange={(e) =>
                                    handleChange(index, "from", e.target.value)
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <label className="block text-gray-600 mt-4 mb-1">
                                To:
                            </label>
                            <input
                                type="text"
                                value={scan.to}
                                onChange={(e) =>
                                    handleChange(index, "to", e.target.value)
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <label className="block text-gray-600 mt-4 mb-1">
                                Date:
                            </label>
                            <input
                                type="date"
                                value={scan.date}
                                min={new Date().toISOString().split("T")[0]} // Today
                                max={
                                    new Date(
                                        Date.now() + 10 * 24 * 60 * 60 * 1000
                                    )
                                        .toISOString()
                                        .split("T")[0]
                                } // Today + 10 days
                                onFocus={(e) => e.target.showPicker()} // This triggers the date picker
                                onChange={(e) =>
                                    handleChange(index, "date", e.target.value)
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                            />
                        </div>
                    ))}
                </div>
                {scans.length > 0 && (
                    <button
                        onClick={sendData}
                        className="w-full mt-6 px-4 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                    >
                        Start Scanning
                    </button>
                )}
            </div>
        </div>
    );
};

export default Home;
