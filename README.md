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

# Participant roles

A room is open by default: everyone who joins can edit. An editor can turn on view-only for the room:

| Event | Direction | Payload |
| --- | --- | --- |
| `join-room` | client → server | `roomID`, optional `editorToken` |
| `enable-view-only` | client → server | `roomID`, ack with the new `editorToken` |
| `room-role` | server → client | `"editor"` or `"viewer"` for the joining socket |
| `room-roles-change` | server → room | `{ [socketId]: "editor" \| "viewer" }` |
| `broadcast-rejected` | server → client | `roomID` of a scene update the server dropped |

After view-only is on, sockets that join without the editor token are viewers. The server drops their scene updates (`server-broadcast`) and answers with `broadcast-rejected`. Cursor and idle updates (`server-volatile-broadcast`) still go through, so editors can see where viewers are looking.
