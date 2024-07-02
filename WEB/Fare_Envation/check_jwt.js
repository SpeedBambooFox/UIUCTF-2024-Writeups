const jwt = require('jsonwebtoken');
const secretKey = 'a_boring_passenger_signing_key_?';
const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6InBhc3Nlbmdlcl9rZXkiLCJ0eXAiOiJKV1QifQ.eyJ0eXBlIjoicGFzc2VuZ2VyIn0.EqwTzKXS85U_CbNznSxBz8qA1mDZOs1JomTXSbsw0Zs';

const decoded = jwt.decode(token, { complete: true });

if (decoded) {
    const header = decoded.header;
    const payload = decoded.payload;

    console.log('Header:', header);
    console.log('Payload:', payload);
} else {
    console.error('Invalid token');
}

try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
} catch (err) {
    console.error('Invalid token', err);
}