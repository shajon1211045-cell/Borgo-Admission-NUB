Neon mock (demo)

This project supports a demo-mode "neon-mock" so you can showcase Neon integration UI/behavior without connecting a real Neon/Postgres instance.

How to use (demo):

- Start the server with the environment variable:

  DATABASE_TYPE=neon-mock

- The server will:
  - initialize a lightweight neon mock client (no external connection)
  - still use the existing local SQLite database for storage and migrations
  - expose /api/ping which returns { message, timestamp, databaseType, useNeonMock }

Notes:

- This is strictly a demo convenience and does NOT provide a real Neon/Postgres connection.
- To connect to a real Neon, follow your MCP connection workflow and set DATABASE_TYPE=neon and provide the required connection env variables.
