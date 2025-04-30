import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const server = new McpServer({
  name: "NextApp Payments Resource",
  version: "1.0.0",
});

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Define the payments resource template
const paymentsResourceTemplate = new ResourceTemplate("payments://done");

// Register the payments resource
server.resource("payments-done", "payments://done", async (uri) => {
  try {
    // Connect to MongoDB
    await client.connect();

    // Access the test collection and payments database
    const db = client.db("test");
    const paymentsCollection = db.collection("payments");

    // Find all payments where done is true
    const payments = await paymentsCollection.find({ done: true }).toArray();

    // Log using console.error instead of console.log
    console.error(
      JSON.stringify({
        type: "info",
        message: `Found ${payments.length} payments with done=true`,
      })
    );

    // Return the payments data
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(payments, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  } catch (error) {
    // Handle any errors that occur
    console.error(
      JSON.stringify({
        type: "error",
        message: "MongoDB Error",
        error: error.message,
      })
    );
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              error: "Failed to fetch payments",
              message: error.message,
            },
            null,
            2
          ),
          mimeType: "application/json",
        },
      ],
    };
  } finally {
    // Always close the connection
    try {
      await client.close();
    } catch (closeError) {
      console.error(
        JSON.stringify({
          type: "error",
          message: "Error closing MongoDB connection",
          error: closeError.message,
        })
      );
    }
  }
});

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log using JSON format
  console.error(
    JSON.stringify({
      type: "info",
      message: "MCP server started and connected to MongoDB Atlas",
    })
  );
}

main().catch((error) =>
  console.error(
    JSON.stringify({
      type: "error",
      message: "Server error",
      error: error.message,
    })
  )
);
