//Creates en EventSource with an URI corresponding to the endpoint we want to get the data from.
const eventSource = new EventSource('/events')

//Adds a listener to do something when connecting to the server.
eventSource.addEventListener('open', (event) => {
    console.log('Connection established successfully!');
});

//Adds a listener to the "message" event. The server will trigger this event when sending data through the connection.
eventSource.addEventListener('message', (event) => {
    console.log('event id: ' + event.lastEventId);
    console.log('event data: ' + event.data);
    const counter = document.querySelector('#counter');
    counter.textContent = event.data;
});

//Adds a listener to the "error" event, triggered on network timeouts or access issues.
eventSource.addEventListener('error', async (event) => {
    switch (event.target.readyState) {
        case EventSource.CONNECTING:
            console.log('Reconnecting...');
            for (let i = 1; i <= 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log(`Waiting for ${i} seconds...`);
            }
            break;
        case EventSource.CLOSED:
            console.log('Connection failed, will not reconnect.');
            break;
    }
    console.log(event);
});

//Adds a listener to listen for "testing" events data only.
eventSource.addEventListener('testing', (event) => {
    console.log('testing data is being received successfully!');
    console.log(event.data);
})