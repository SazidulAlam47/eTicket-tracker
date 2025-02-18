import puppeteer from "puppeteer";
import { targetUrls } from './index.js';

let browserInstance;
export const ticketArray = [];
const pageReloadIntervals = [];
const pageTimeouts = [];

export async function startPuppeteer() {
    browserInstance = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ["--start-maximized"],
    });

    for (let url of targetUrls) {
        const page = await browserInstance.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        let checked = false;

        const getSeats = async () => {
            if (!page) {
                console.error('Page is not initialized');
                return;
            }

            const seats = await page.$$('.all-seats');

            if (seats.length) {
                checked = true;
                const data = await page.evaluate(() => {
                    const seatElements = document.querySelectorAll('.all-seats');
                    const results = [];

                    seatElements.forEach((seat) => {
                        const seatNumber = parseInt(seat.innerText);
                        if (seatNumber > 0) {
                            const trainNameParent = seat.closest('.single-trip-wrapper');
                            const trainName = trainNameParent.querySelector('.trip-name h2')?.innerText.trim() || 'Train not found';

                            const seatClassParent = seat.closest('.single-seat-class');
                            const seatClass = seatClassParent.querySelector('.seat-class-name')?.innerText.trim() || 'Class not found';

                            results.push({
                                fromTo: document.querySelector('.from_to_location')?.innerText || 'From-To not found',
                                train: trainName,
                                class: seatClass,
                                date: document.querySelector('.date_time')?.innerText || 'Date not found',
                                seat: seatNumber,
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                                link: window.location.href,
                            });
                        }
                    });

                    return results;
                });

                data.forEach(ticket => {
                    const exists = ticketArray.some(t =>
                        t.train === ticket.train &&
                        t.class === ticket.class &&
                        t.date === ticket.date &&
                        t.seat === ticket.seat &&
                        t.fromTo === ticket.fromTo
                    );

                    if (!exists) {
                        ticketArray.push(ticket);
                    }
                });

                console.log(data);
            }
        };

        const timeDelay = [500, 1000, 5000, 10000, 15000];

        const reloadAndGrabData = async () => {
            console.log("Reloading page...");
            await page.reload({ waitUntil: "networkidle2" });
            checked = false;
            console.log("Page reloaded, fetching data...");
            await getSeats();
        };

        for (let delay of timeDelay) {
            const timeoutId = setTimeout(async () => {
                if (!checked) {
                    console.log(`Checked after: ${delay / 1000} seconds`);
                    await getSeats();
                }
            }, delay);
            pageTimeouts.push(timeoutId);
        }

        const intervalId = setInterval(async () => {
            await reloadAndGrabData();
        }, 20000);
        pageReloadIntervals.push(intervalId);

        page.on('close', () => console.log(`Closed page for ${url}`));
    }
}

export async function stopPuppeteer() {
    if (!browserInstance) {
        console.log("Puppeteer is not running or has already been stopped.");
        return;
    }

    console.log("Stopping Puppeteer...");

    try {
        pageTimeouts.forEach(clearTimeout);
        pageTimeouts.length = 0;

        pageReloadIntervals.forEach(clearInterval);
        pageReloadIntervals.length = 0;

        const pages = await browserInstance.pages();
        for (let page of pages) {
            try {
                page.removeAllListeners();
                await page.evaluate(() => window.stop());
                await page.close({ runBeforeUnload: true });
            } catch (error) {
                console.warn(`Error closing page: ${error.message}`);
            }
        }

        if (browserInstance.isConnected()) {
            await browserInstance.close();
        }

        const browserProcess = browserInstance.process();
        if (browserProcess) {
            try {
                process.kill(browserProcess.pid, 'SIGKILL');
            } catch (error) {
                console.warn(`Puppeteer process was already terminated: ${error.message}`);
            }
        }

        console.log("Puppeteer stopped successfully.");
    } catch (error) {
        console.error("Error while stopping Puppeteer:", error);
    } finally {
        browserInstance = null;
    }
}