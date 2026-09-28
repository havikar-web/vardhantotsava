async function testMetaCors() {
  try {
    const res = await fetch('https://graph.facebook.com/v19.0/1337239006142926/messages', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3200',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    console.log('OPTIONS status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
  } catch (e) {
    console.error(e);
  }
}
testMetaCors();
