# First steps into EventSource and SSE (Server-Sent events)

These are my first steps into EventSource and SSE (Server-Sent events).  

## Differences between SSEs and WebSockets
- The major difference between WebSockets and Server-Sent Events is that WebSockets are bidirectional (allowing communication between the client and the server) while SSEs are mono-directional (only allowing the client to receive data from the server).
- SSE is built on top of the HTTP protocol, so we don't need custom URLs like `ws://`, new protocols, or different server implementations (no need for NPM modules like `ws`, or full-duplex connections and new WebSocket servers).
- SSEs come with automatic reconnection, event IDs and the ability to send arbitrary events.
- WebSockets have the ability to detect a dropped client connection, unlike in SSEs where messages will have to be sent first before detecting the same issue.
- WebSockets have received more attention (and appreciation) than SSEs. More browsers support WebSockets natively than SSEs. However, there are available polyfills that simulate the SSE functionality to solve this issue.
- WebSockets can transmit both binary data and UTF-8, whereas SSEs are limited to UTF-8.
- SSEs suffer from a limitation to the maximum number of open connections, which can be especially painful when opening various tabs, as the limit is per browser is six.

## Additional comments
- Unlike techniques like "Long Polling" (also known as "Hanging GET"), SSEs are handled by the browser. The user only has to listen to messages.

## SSE Automatic Reconnection
Whenever the connection is closed, the browser will automatically reconnect to the source after ~3 seconds. The server implementation can have control over this timeout by sending a line beginning with `retry`.
For example:
```
retry: 10000\n
``` 

## Sending data from the server
Sending an event stream from the source is a matter of constructing a plaintext response, served with a text/event-stream Content-Type, that follows the SSE format. In its basic form, the response should contain a `data:` line, followed by your message, followed by two `\n` characters to end the stream.
```
data: Hello World!\n\n
```

## Multiline Data
If your message is longer, you can break it up by using multiple `data:` lines. Two or more consecutive lines beginning with `data:` will be treated as a single piece of data, meaning only one message event will be fired. Each line should end in a single "\n" (except for the last, which should end with two). The result passed to your message handler is a single string concatenated by newline characters.
For example:
```
data: Hello\n
data: World!\n\n
```
The data received by the client will be `Hello\nWorld!`, so we will need to reconstruct it (for example, using `event.data.split('\n').join('')`). 

## Sending JSON data
Using multiple lines makes it easy to send JSON without breaking syntax:
```
data: {\n
data: "msg": "hello world",\n
data: "id": 12345\n
data: }\n\n
```
Again, we will need to parse the message in the client, in this case by using `JSON.parse(event.data)`.

## Associating an ID with an event
You can send a unique id with an stream event by including a line starting with `id:`.
For example:
```
id: 12345\n
data: GOOG\n
data: 556\n\n
```
Setting an ID lets the browser keep track of the last event fired so that if, the connection to the server is dropped, a special HTTP header (`Last-Event-ID`) is set with the new request. This lets the browser determine which event is appropriate to fire. The message event contains a `event.lastEventId` property.

## Specifying an event name
A single event source can generate different types events by including an event name. If a line beginning with `event:` is present, followed by a unique name for the event, the event is associated with that name. On the client, an event listener can be setup to listen to that particular event.
For example, the following server output sends three types of events, a generic 'message' event, 'userlogon', and 'update' event:
```
data: {"msg": "First message"}\n\n
event: userlogon\n
data: {"username": "John123"}\n\n
event: update\n
data: {"username": "John123", "emotion": "happy"}\n\n
```
We can then listen to this events in the client side by doing the following:
```
source.addEventListener('message' / 'userlogon' / 'update', function(e) {
  var data = JSON.parse(e.data);
  console.log(data.msg);
}, false);
```

## A word on security
According to [Cross-document messaging security](https://html.spec.whatwg.org/multipage/web-messaging.html#authors):
> Authors should check the origin attribute to ensure that messages are only accepted from domains that they expect to receive messages from. Otherwise, bugs in the author's message handling code could be exploited by hostile sites.
and
> Furthermore, even after checking the origin attribute, authors should also check that the data in question is of the expected format.... 

We should verify `event.origin` in the message handler matches our app's origin, and also the integrity of the data we're receiving.

## Polyfilling
Some older or obstinate browsers do not have native support for Server-Sent Events. Because SSE is over HTTP, it is easy to polyfill in a Javascript application, and there are several open source polyfills available.

**Client**  
- The client just creates an EventSource object, and receives consecutive numbers from the server.
- Note that if the express server goes down, if we turn it on again, then the client will start receiving the information automatically.

**Server**  
- The server has an endpoint named `/events` from where it'll send consecutive numbers to the clients that instantiate an EventSource object with that route.
- Features a rudimentary IP validation to block several connections from the same remote address.

# Resources

[WebSockets vs Server-Sent Events - Telerik](https://www.telerik.com/blogs/websockets-vs-server-sent-events)  
[Using server-sent events - MDN](https://masteringjs.io/tutorials/express/server-sent-events)  
[Server-Sent Events with Express - MasteringJS](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)  
[Stream Updates with Server-Sent Events](https://www.html5rocks.com/en/tutorials/eventsource/basics/#toc-reconnection-timeout)
