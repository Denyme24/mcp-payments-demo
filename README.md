# MCP Server - NextApp Payments Resource (Demo)

This is a demonstration project showcasing how to implement a Model Context Protocol (MCP) server to access payment data from a MongoDB Atlas database. The project serves as an example of how to use the MCP protocol to expose database resources through a standardized interface.

## Project Overview

This demo project:

- Implements an MCP server using the official SDK
- Connects to a specific MongoDB Atlas database
- Retrieves payment records where `done` is true (successfully completed payments)
- Serves as a reference implementation for MCP server usage

## Important Note

This project is for demonstration purposes only. The MongoDB connection and resource configurations are specific to the author's MongoDB Atlas database. You cannot directly use this project as-is since it's configured for a specific database instance.

## What You Can Learn From This Demo

- How to set up an MCP server
- How to connect MCP server to MongoDB Atlas
- How to define resource templates for database access
- How to handle database operations through MCP
- Error handling patterns for MCP server implementation

## Project Structure

```
mcp_server/
├── index.js           # Main server implementation
├── package.json       # Project configuration and dependencies
├── package-lock.json  # Dependency lock file
└── .env              # Environment variables (not included in repo)
```

## Implementation Details

### MCP Resource

- **URI**: `payments://done`
- **Purpose**: Retrieves payment records where `done` is true
- **Response Format**: JSON
- **MIME Type**: `application/json`

### Dependencies Used

- `@modelcontextprotocol/sdk`: ^1.10.2 - Official MCP SDK
- `dotenv`: ^16.5.0 - Environment variable management
- `mongodb`: ^6.16.0 - MongoDB Node.js driver

## Error Handling

The implementation includes error handling for:

- MongoDB connection issues
- Query execution errors
- Connection closure errors

## License

ISC

## Note for Developers

If you want to implement your own MCP server:

1. Create your own MongoDB database
2. Update the connection string in `.env`
3. Modify the resource template in `index.js` to match your data structure
4. Implement your own error handling as needed
