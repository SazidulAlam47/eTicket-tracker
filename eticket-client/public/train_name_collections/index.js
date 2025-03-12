const fs = require('node:fs/promises'); // Use promises for easier file handling

async function getUniqueCities(models, departureDate) {
    const uniqueCities = new Set();

    for (const model of models) {
        try {
            const response = await fetch('https://railspaapi.shohoz.com/v1.0/web/train-routes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    departure_date_time: departureDate,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            data.data.routes.forEach(route => uniqueCities.add(route.city));

        } catch (error) {
            console.error(`Error fetching data for model ${model}:`, error);
        }
    }

    return Array.from(uniqueCities);
}


async function saveCitiesToFile(cities, filename = 'all_train_stations.txt') {
    try {
        await fs.writeFile(filename, cities.join('\n'));  // Join with newline for readability
        console.log(`Unique cities saved to ${filename}`);
    } catch (error) {
        console.error(`Error saving cities to file:`, error);
    }
}


const trainModels = [
  "771", "772", "793", "794", "705", "706", "727", "728", "769", "770",
  "747", "748", "783", "784", "759", "760", "753", "754", "775", "776",
  "751", "752", "797", "798", "755", "756", "731", "757", "758", "765",
  "763", "766", "764", "715", "716", "725", "726", "803", "804", "795",
  "796", "733", "734", "761", "762", "779", "780", "713", "714", "768",
  "767", "791", "792", "787", "788", "701", "702", "703", "704", "707",
  "708", "711", "712", "709", "710", "717", "718", "719", "720", "721",
  "722", "723", "724", "735", "736", "737", "738", "739", "740", "741",
  "742", "743", "744", "745", "746", "749", "750", "773", "774", "781",
  "782", "785", "786", "789", "790", "799", "800", "801", "802", "729",
  "730", "777", "778", "57", "58", "77", "78", "805", "806", "61", "62",
  "65", "66", "813", "814", "809", "810", "815", "816", "732", "41", "42",
  "825", "826", "827", "828", "821", "824", "822", "823", "109", "110"
];
const departureDate = "2025-03-13";


async function main() {  // Use an async main function
    try {
        const cities = await getUniqueCities(trainModels, departureDate);
        await saveCitiesToFile(cities);
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

main(); // Call the main function to start the process