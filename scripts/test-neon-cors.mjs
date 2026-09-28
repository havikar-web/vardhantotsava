async function testNeonCors() {
  try {
    const res = await fetch('https://ep-snowy-mountain-b3y288s0-pooler.c-4.ap-southeast-1.aws.neon.tech/sql', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3200',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Neon-Connection-String'
      }
    });
    console.log('OPTIONS status:', res.status);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
  } catch (e) {
    console.error(e);
  }
}
testNeonCors();
