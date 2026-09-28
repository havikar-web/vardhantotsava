const token = 'EAA3srEndgnwBSoBJqylF683YKswnIEOeYC1aGFYE2MHu8rBVGHLDhvx5MfucH3ISPm06x40A7FAiKALrkFWc7BlB9VAEvjvnPtkC8HNE6USZBLcPhaZAux4ykwZBuYlfTV8pzm3R11H0ZABhFGZB7hgkAUMRTWQtCU7ZBbeU88zgead9ch36CZCZC8ZBr6h2TYS7YtQZDZD';
const phoneId = '1337239006142926';

async function testMeta() {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testMeta();
