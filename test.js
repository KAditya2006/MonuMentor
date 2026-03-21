const http = require('http');

const data = JSON.stringify({
  username: "testuser1",
  email: "testuser1@test.com",
  mobile: "0987654321",
  password: "password123"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', (e) => console.error('Request failed:', e.message));
req.write(data);
req.end();
