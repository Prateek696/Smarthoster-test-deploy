export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log(`🔄 Proxying invoice request for URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf,*/*'
      },
      timeout: 30000 // 30 second timeout
    });
    
    if (!response.ok) {
      console.error(`❌ External URL returned ${response.status}: ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    
    if (buffer.byteLength === 0) {
      throw new Error('Received empty response');
    }
    
    console.log(`✅ Successfully proxied invoice, size: ${buffer.byteLength} bytes`);
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.setHeader('Content-Length', buffer.byteLength.toString());
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('❌ Invoice proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch invoice',
      details: error.message 
    });
  }
}
