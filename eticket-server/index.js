const express = require('express');
const cors = require('cors');
const app = express();
const port = 8040;

//middleware
app.use(cors());
app.use(express.json());

const ticketArray = [];

setInterval(() => {
    if (ticketArray.length > 6) {
        ticketArray.shift();
    }
}, 500);

app.post('/ticket', (req, res) => {
    const { body } = req;
    ticketArray.push(body);
    console.log(body);
    res.send({ success: true });
});

app.get('/ticket', (req, res) => {
    res.send(ticketArray);
});

app.get('/clear', (req, res) => {
    ticketArray.length = 0;
    res.send({ success: true });
});

app.get('/', (req, res) => {
    res.send('e-ticket Server is running');
});

app.listen(port, () => {
    console.log(`e-ticket Server is running on port ${port}`);
});
