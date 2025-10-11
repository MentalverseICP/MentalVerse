import dotenv from 'dotenv'
import express from 'express'
import fetch from 'node-fetch'

dotenv.config({ override: true })
const app = express();
const PORT = process.env.PORT || 8080;
const CANISTER_ID = process.env.CANISTER_ID;
const DFX_URL = process.env.DFX_URL || 'http://localhost:4943';
const BACKEND_CANISTER_ID = process.env.BACKEND_CANISTER_ID;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/cbor', limit: '10mb' }));

// Enhanced logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MCP proxy endpoint with enhanced error handling
app.post('/mcp', async (req, res) => {
  if (!CANISTER_ID) {
    return res.status(500).json({ 
      error: 'CANISTER_ID not configured',
      message: 'Please set CANISTER_ID in environment variables'
    });
  }

  const host = new URL(DFX_URL).host;
  // Prefer the query-param routing for local replica; avoids subdomain DNS issues
  const canisterUrl = `${DFX_URL}/mcp/?canisterId=${CANISTER_ID}`;
  
  try {
    console.log(`Forwarding request to: ${canisterUrl}`);
    
    const response = await fetch(canisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body || {}),
      timeout: 30000 // 30 second timeout
    });

    const responseData = await response.text();
    
    // Forward response status and headers
    res.status(response.status);
    if (response.headers.get('content-type')) {
      res.set('Content-Type', response.headers.get('content-type'));
    }
    
    if (response.ok) {
      console.log('Request forwarded successfully');
      res.send(responseData);
    } else {
      console.error(`Canister error: ${response.status} - ${responseData}`);
      res.json({
        error: 'Canister communication failed',
        status: response.status,
        message: responseData
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy communication failed',
      message: error.message,
      canister_url: canisterUrl
    });
  }
});

// Add GET handler for /mcp to support tools that use GET for health/handshake
app.get('/mcp', async (req, res) => {
  if (!CANISTER_ID) {
    return res.status(500).json({ 
      error: 'CANISTER_ID not configured',
      message: 'Please set CANISTER_ID in environment variables'
    });
  }

  // Prefer subdomain-style routing for GET on local replica; fallback to query-parameter style
  const subdomainUrl = `http://${CANISTER_ID}.localhost:${new URL(DFX_URL).port || 4943}/mcp`;
  const qpUrl = `${DFX_URL}/mcp/?canisterId=${CANISTER_ID}`;

  const tryFetch = async (url) => {
    console.log(`Forwarding GET request to: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      timeout: 15000,
    });
    const responseData = await response.text();

    res.status(response.status);
    const ct = response.headers.get('content-type');
    if (ct) res.set('Content-Type', ct);
    res.send(responseData);
  };

  try {
    await tryFetch(subdomainUrl);
  } catch (subErr) {
    console.warn(`Subdomain routing failed, falling back to query-param routing. Error: ${subErr.message}`);
    try {
      await tryFetch(qpUrl);
    } catch (qpErr) {
      console.error('Proxy GET error:', qpErr);
      res.status(500).json({
        error: 'Proxy communication failed',
        message: qpErr.message,
        canister_url: qpUrl,
      });
    }
  }
});

// Support HEAD requests similarly to GET for handshake checks
app.head('/mcp', async (req, res) => {
  if (!CANISTER_ID) {
    return res.status(500).json({ 
      error: 'CANISTER_ID not configured',
      message: 'Please set CANISTER_ID in environment variables'
    });
  }

  const subdomainUrl = `http://${CANISTER_ID}.localhost:${new URL(DFX_URL).port || 4943}/mcp`;
  const qpUrl = `${DFX_URL}/mcp/?canisterId=${CANISTER_ID}`;

  const tryHead = async (url) => {
    console.log(`Forwarding HEAD request to: ${url}`);
    const response = await fetch(url, { method: 'HEAD', timeout: 10000 });
    res.status(response.status);
    res.end();
  };

  try {
    await tryHead(subdomainUrl);
  } catch (subErr) {
    console.warn(`Subdomain HEAD failed, falling back to query-param routing. Error: ${subErr.message}`);
    try {
      await tryHead(qpUrl);
    } catch (qpErr) {
      console.error('Proxy HEAD error:', qpErr);
      res.status(500).json({
        error: 'Proxy communication failed',
        message: qpErr.message,
        canister_url: qpUrl,
      });
    }
  }
});

// Health check endpoint with backend validation
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    canister_id: CANISTER_ID,
    backend_canister_id: BACKEND_CANISTER_ID,
    dfx_url: DFX_URL
  };

  // Check backend connectivity if configured
  if (BACKEND_CANISTER_ID) {
    try {
      const backendUrl = `${DFX_URL}/api/v2/canister/${BACKEND_CANISTER_ID}/call`;
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/cbor' },
        timeout: 5000
      });
      health.backend_status = response.ok ? 'connected' : 'error';
    } catch (error) {
      health.backend_status = 'unreachable';
      health.backend_error = error.message;
    }
  } else {
    health.backend_status = 'not_configured';
  }

  res.json(health);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MCP Server Proxy',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      mcp: '/mcp (GET, POST)'
    },
    configuration: {
      canister_id: CANISTER_ID || 'not_set',
      backend_canister_id: BACKEND_CANISTER_ID || 'not_set',
      dfx_url: DFX_URL
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Proxy Server running on port ${PORT}`);
  console.log(`Canister ID: ${CANISTER_ID || 'NOT SET'}`);
  console.log(`Backend Canister ID: ${BACKEND_CANISTER_ID || 'NOT SET'}`);
  console.log(`DFX URL: ${DFX_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});