# Example of excalidraw collaboration server

Collaboration server for Excalidraw

If you need to use cluster mode with pm2. Checkout: https://socket.io/docs/v4/pm2/

If you are not familiar with pm2: https://pm2.keymetrics.io/docs/usage/quick-start/

# Development

- install

  ```sh
  yarn
  ```

- run development server

  ```sh
  yarn start:dev
  ```

# Start with pm2

```
pm2 start pm2.production.json
```

# Configuration

- `PORT`: port to listen on (defaults to 3002 in development, 80 otherwise)
- `CORS_ORIGIN`: allowed origin for socket connections (defaults to `*`)
- `MAX_ROOM_USERS`: maximum number of people in one room (defaults to 50, `0` disables the limit). Clients that try to join a full room receive a `room-full` event with the limit and are not added to the room.
