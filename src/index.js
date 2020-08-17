const express = require('express');
const path = require('path');

const app = express();

//const uniqueAddresses = new Set();

app.use(express.static(path.join(__dirname, '..', 'client')));

//Set an endpoint for sending data to the client
app.get('/events', async (req, res) => {
    // if (uniqueAddresses.has(req.ip)) {
    //     // HTTP status code for "Too Many Requests"
    //     return res.sendStatus(429);
    // }
    // uniqueAddresses.add(req.ip);

    res.set({
        'Cache-Control': 'no-cache', // recommended to prevent caching of event data.
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
    });
    res.flushHeaders();

    //We'll use a counter that's going to be incremented and sent to the client.
    let counter = 0;

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Sending ', ++counter);
        //Sets the max retry time to 10 seconds. This means the client will retry to reconnect to the server for 10 seconds.
        res.write(`retry: 10000\n`);
        //Sending an Event-ID that will be used by the client when reconnecting to the server.
        res.write(`id: ${counter}\n`);
        res.write(`data: ${counter}\n\n`);
        //Sending an event line to specify a specific event to be listened by the client.
        res.write(`event: testing\n`);
        res.write(`data: test data\n\n`);
    }
})

const port = process.env.PORT || 3000;
app.listen(port);
