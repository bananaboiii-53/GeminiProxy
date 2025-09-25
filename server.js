// A simple and robust proxy server using Node.js and Express.
// This server fetches content from a given URL and streams it back to the client.

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS to allow the frontend to communicate with this server
app.use(cors());
// Serve the static HTML file for the browser UI
app.use(express.static('public'));

// The core proxy endpoint
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('<h1>Error: URL is required</h1><p>Please provide a URL parameter, like: /proxy?url=https://example.com</p>');
    }

    console.log(`Proxying request to: ${targetUrl}`);

    try {
        // Make a request to the target URL using axios
        const response = await axios({
            method: 'get',
            url: targetUrl,
            responseType: 'stream', // Important to handle all content types, like images
            // Spoof the user agent to mimic a real browser
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Pipe the response from the target URL directly to the client
        // This forwards the headers, status, and content
        res.status(response.status);
        
        // Forward most headers from the target response to the client
        // We avoid forwarding security-related headers that can break the proxy.
        for (const key in response.headers) {
            if (!['content-security-policy', 'x-frame-options', 'strict-transport-security'].includes(key.toLowerCase())) {
                 res.setHeader(key, response.headers[key]);
            }
        }
       
        response.data.pipe(res);

    } catch (error) {
        console.error("Proxy Error:", error.message);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).send(`<h1>Error</h1><p>Could not fetch the page. The server responded with status: ${error.response.status}</p>`);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(502).send('<h1>Error: Bad Gateway</h1><p>Could not connect to the target server.</p>');
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).send('<h1>Error: Internal Server Error</h1><p>An unexpected error occurred.</p>');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
