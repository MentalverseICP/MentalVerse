import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import dotenv from "dotenv";


dotenv.config();
console.log("Loaded canister:", process.env.CANISTER_ID);

const app = express();
app.use(bodyParser.json());

const CANISTER_ID = process.env.CANISTER_ID || "znjvm-maaaa-aaaac-a4ora-cai";
const DFX_URL = process.env.DFX_URL || "http://127.0.0.1:4943";

app.post("/mcp", async (req, res) => {
  try {
    console.log('Received MCP request:', JSON.stringify(req.body, null, 2));
    
    // Use raw domain to bypass certification issues
    const canisterUrl = `http://${CANISTER_ID}.localhost:4943/mcp`;
    
    const canisterResponse = await fetch(canisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    console.log('Canister Response status:', canisterResponse.status);
    console.log('Canister Response headers:', canisterResponse.headers.raw());

    if (!canisterResponse.ok) {
      console.error('Canister HTTP request failed:', canisterResponse.status, canisterResponse.statusText);
      return res.status(500).json({
        jsonrpc: '2.0',
        id: req.body.id || null,
        error: {
          code: -32603,
          message: `Canister HTTP request failed: ${canisterResponse.status} ${canisterResponse.statusText}`
        }
      });
    }

    // Get response content type from canister
    const contentType = canisterResponse.headers.get('content-type') || 'application/json';
    
    // Forward the response with the same content type
    res.setHeader('Content-Type', contentType);
    
    // Handle different response types
    if (contentType.includes('application/json')) {
      const jsonResponse = await canisterResponse.json();
      res.json(jsonResponse);
    } else {
      const responseBuffer = await canisterResponse.buffer();
      res.send(responseBuffer);
    }

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", canister_id: CANISTER_ID, dfx_url: DFX_URL });
});

// Root endpoint with information
app.get("/", (req, res) => {
  res.json({
    message: "MCP Proxy Server for MentalVerse IC Canister",
    canister_id: CANISTER_ID,
    dfx_url: DFX_URL,
    endpoints: {
      mcp: "/mcp",
      health: "/health"
    }
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 MCP proxy listening on port ${PORT}`);
  console.log(`📡 Forwarding to canister: ${CANISTER_ID}`);
  console.log(`🔗 DFX URL: ${DFX_URL}`);
  console.log(`💡 Test with: curl http://localhost:${PORT}/health`);
});