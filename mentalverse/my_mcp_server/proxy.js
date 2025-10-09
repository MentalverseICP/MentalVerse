import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CANISTER_ID = "uxrrr-q7777-77774-qaaaq-cai";
const DFX_URL = "http://127.0.0.1:4943";

app.post("/mcp", async (req, res) => {
  try {
    console.log("Received MCP request:", JSON.stringify(req.body, null, 2));
    
    // Forward the request to the IC canister
    const icRes = await fetch(`${DFX_URL}/api/v2/canister/${CANISTER_ID}/call`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/cbor",
        "Accept": "application/cbor"
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await icRes.text();
    console.log("IC response:", data);
    
    res.send(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send({ error: err.message });
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