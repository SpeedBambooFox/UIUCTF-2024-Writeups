const jwt = require('jsonwebtoken');

const secretKey = 'conductor_key_873affdf8cc36a592ec790fc62973d55f4bf43b321bf1ccc0514063370356d5cddb4363b4786fd072d36a25e0ab60a78b8df01bd396c7a05cccbbb3733ae3f8e';

const newJwt = jwt.sign({ type: 'conductor' }, secretKey, { algorithm: 'HS256', header: { alg: 'HS256', kid: `129581926211651571912466741651878684928`, typ: 'JWT' } });
console.log(newJwt)