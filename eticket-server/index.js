import express from "express";
import cors from "cors";
import { isPuppeteerRunning, startPuppeteer, stopPuppeteer, ticketArray } from "./puppeteer.js";

const app = express();
const port = 8040;

// Middleware
app.use(cors());
app.use(express.json());

export let targetUrls = [];

app.get("/", (req, res) => {
    res.send('ticket tracker server is running');
});

app.get('/tickets', (req, res) => {
    if (!isPuppeteerRunning()) {
        return res.status(503).json({
            success: false,
            message: "Puppeteer is not running. Please start Puppeteer and try again."
        });
    }

    res.json({
        success: true,
        tickets: ticketArray
    });
});


app.get("/clear", (req, res) => {
    ticketArray.length = 0;
    res.json({ success: true });
});

app.get("/stop", (req, res) => {
    stopPuppeteer();
    ticketArray.length = 0;
    res.json({ success: true });
});

app.post("/start", (req, res) => {

    const data = req.body;

    targetUrls = data.map(item => {
        const fromCity = (item.from.charAt(0).toUpperCase() + item.from.slice(1).toLowerCase()).trim();
        const toCity = (item.to.charAt(0).toUpperCase() + item.to.slice(1).toLowerCase()).trim();
        const date = new Date(item.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/ /g, '-');

        return `https://eticket.railway.gov.bd/booking/train/search?fromcity=${fromCity}&tocity=${toCity}&doj=${date}&class=S_CHAIR`;
    });

    console.log(targetUrls);

    startPuppeteer();
    res.json({ success: true });
});

// Start the Express Server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/`);
});

export default app;