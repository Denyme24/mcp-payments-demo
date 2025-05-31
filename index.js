import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MongoClient } from "mongodb";

const server = new Server(
  {
    name: "NextApp Payments Resource",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    JSON.stringify({
      type: "error",
      message: "MONGODB_URI environment variable is required",
    })
  );
  process.exit(1);
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_completed_payments",
        description: "Get all payments where done is true",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_all_payments",
        description: "Get all payments from the database",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;

  let mongoClient;
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();

    const db = mongoClient.db("test");
    const paymentsCollection = db.collection("payments");

    let payments;
    let message;

    if (name === "get_completed_payments") {
      payments = await paymentsCollection.find({ done: true }).toArray();
      message = `Found ${payments.length} completed payments`;
    } else if (name === "get_all_payments") {
      payments = await paymentsCollection.find({}).toArray();
      message = `Found ${payments.length} total payments`;
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    console.error(
      JSON.stringify({
        type: "info",
        message: message,
      })
    );

    return {
      content: [
        {
          type: "text",
          text: `${message}:\n\n${JSON.stringify(payments, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    console.error(
      JSON.stringify({
        type: "error",
        message: "MongoDB Error",
        error: error.message,
      })
    );

    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  } finally {
    if (mongoClient) {
      try {
        await mongoClient.close();
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
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "payments://done",
        name: "Completed Payments",
        description: "All payments where done is true",
        mimeType: "application/json",
      },
    ],
  };
});

// Handle resource read requests
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "payments://done") {
    let mongoClient;
    try {
      mongoClient = new MongoClient(process.env.MONGODB_URI);
      await mongoClient.connect();

      const db = mongoClient.db("test");
      const paymentsCollection = db.collection("payments");
      const payments = await paymentsCollection.find({ done: true }).toArray();

      console.error(
        JSON.stringify({
          type: "info",
          message: `Found ${payments.length} payments with done=true`,
        })
      );

      return {
        contents: [
          {
            uri: uri,
            text: JSON.stringify(payments, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    } catch (error) {
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
            uri: uri,
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
      if (mongoClient) {
        try {
          await mongoClient.close();
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
    }
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
});

// Main function to start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(
    JSON.stringify({
      type: "info",
      message: "MCP server started with tools and resources",
    })
  );
}

main().catch((error) =>
  console.error(
    JSON.stringify({
      type: "error",
      message: "Server startup error",
      error: error.message,
    })
  )
);
