# Snore Signatures

Solver: `Andy` in `SpeedBambooFox`

```
Category: Cryptography
Author: Richard
Points: 416/500
Solves: 17/122
```

## Challange description

> These signatures are a bore!

## Overview
In this challenge, the challenge provide a snore signature process. 
1. The program will generate a ```snore group```: $(p, q, g)$
2. Then repeat 10 times:
> 1. With giving the public key $y$, user input the a message $m_1$. The program will returns the signature $(s_1, e)$
> 2. Without changing the $e$, user inputs a new message $m_2$ and a forged signature $s_2$
3. After 10 times sucess, we will get the flag.

## Snore Signature Process
### I. Group Generation (```gen_snore_group```)
Generates the fundamental parameters for the signature scheme
1. Generate a prime $q$ of N bits (default 512 bits).
2. Find a prime $p$ such that $p = X - X \\ mod \\ (2q) + 1$, where $X$ is a random 2N-bit number. This ensures that $p - 1$ is divisible by $q$.
3. Compute $r = (p - 1) / q$.
4. Find a generator g:
> 1. Choose a random $h$ from $[2, p-1]$.
> 2. Compute $g = h^r \\ mod \\ p$. If $g ≠ 1$, it's a valid generator.
- The resulting $(p, q, g)$ form a cyclic subgroup of order $q$ within $Z_p*$.

### II. Key Generation (```snore_gen```):
- Private key: $x$ is randomly chosen from $[1, q-1]$.
- Public key: $y = g^{(-x)} \\ mod \\ p$.
> Note: This is slightly different from standard Schnorr, which usually uses $y = g^x \\ mod \\ p$.

### III. Signing Process (```snore_sign```):
Input: message $m$, private key $x$, group parameters $(p, q, g)$
1. Choose a random $k$ from $[1, q-1]$.
2. Compute $r = g^k \\ mod \\ p$.
3. Compute $e = hash((r + m) \\ mod \\ p) \\ mod \\ q$.
> The hash function used is a custom implementation based on SHA-512. It processes the input in 512-bit chunks and combines them using XOR.
4. Compute $s = (k + x * e) \\ mod \\ q$.
5. The signature is the pair $(s, e)$

### IV. Verification Process (```snore_verify```):
Input: message $m$, signature $(s, e)$, public key $y$, group parameters $(p, q, g)$
1. Check if $0 < s < q$. If not, the signature is **invalid**.
2. Compute $rv = (g^s * y^e) \\ mod \\ p$.
3. Compute $ev = hash((rv + m) \\ mod \\ p) \\ mod \\ q$.
4. The signature is valid if $ev == e$.

## Solution
- Observe the signature process, we can find that
- With same $(p, k, g), x, y$
- If $m$ with key $(r, e)$ is a valid signature, $m+p$ with key $(r, e)$ will also be a valid signature
- So we set $m2 = m1+p$ and forged $s2 = s1$
