import puppeteer from "puppeteer";
import { targetUrls } from './index.js';


let browserInstance; // Store the browser instance to use in stopPuppeteer function
export const ticketArray = [];
const pageReloadIntervals = []; // Store interval IDs for page reloads
const pageTimeouts = []; // Store timeout IDs for initial checks

export async function startPuppeteer() {
    browserInstance = await puppeteer.launch({
        headless: true, // Set to true for headless mode
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
                            // Train Name Extraction
                            const trainNameParent = seat.closest('.single-trip-wrapper');
                            const trainName = trainNameParent.querySelector('.trip-name h2')?.innerText.trim() || 'Train not found';

                            // Train Class Extraction
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

                ticketArray.push(...data); // Add the fetched ticket data to the ticketArray
                console.log(data);
            }
        };

        const timeDelay = [500, 1000, 5000, 10000, 15000];

        // Function to reload the page and get data after reload
        const reloadAndGrabData = async () => {
            console.log("Reloading page...");
            await page.reload({ waitUntil: "networkidle2" });
            checked = false;
            console.log("Page reloaded, fetching data...");
            await getSeats(); // Re-run the data fetching function after page reload
        };

        // Set timeouts to fetch data at different intervals
        for (let delay of timeDelay) {
            const timeoutId = setTimeout(async () => {
                if (!checked) {
                    console.log(`Checked after: ${delay / 1000} seconds`);
                    await getSeats();
                }
            }, delay);
            pageTimeouts.push(timeoutId);
        }

        // Reload the page every 20 seconds and grab data after reloading
        const intervalId = setInterval(async () => {
            await reloadAndGrabData();
        }, 20000);
        pageReloadIntervals.push(intervalId);

        // Close the page after processing
        page.on('close', () => console.log(`Closed page for ${url}`));
    }
}

// Function to stop Puppeteer
export async function stopPuppeteer() {
    if (!browserInstance) {
        console.log("Puppeteer is not running or has already been stopped.");
        return;
    }

    console.log("Stopping Puppeteer...");

    try {
        // Step 1: Clear all timeouts and intervals
        pageTimeouts.forEach(clearTimeout);
        pageTimeouts.length = 0;

        pageReloadIntervals.forEach(clearInterval);
        pageReloadIntervals.length = 0;

        // Step 2: Close all open pages gracefully
        const pages = await browserInstance.pages();
        for (let page of pages) {
            try {
                page.removeAllListeners(); // Prevent async tasks from triggering after close
                await page.evaluate(() => window.stop()); // Stop any ongoing network requests
                await page.close({ runBeforeUnload: true });
            } catch (error) {
                console.warn(`Error closing page: ${error.message}`);
            }
        }

        // Step 3: Close the browser instance only if it's still connected
        if (browserInstance.isConnected()) {
            await browserInstance.close();
        }

        // Step 4: Force kill Puppeteer process (if it still exists)
        const browserProcess = browserInstance.process();
        if (browserProcess) {
            try {
                process.kill(browserProcess.pid, 'SIGKILL'); // Hard kill the process
            } catch (error) {
                console.warn(`Puppeteer process was already terminated: ${error.message}`);
            }
        }

        console.log("Puppeteer stopped successfully.");
    } catch (error) {
        console.error("Error while stopping Puppeteer:", error);
    } finally {
        browserInstance = null; // Ensure it's fully reset
    }
}



