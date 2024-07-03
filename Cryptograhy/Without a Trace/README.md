## Without a Trace

Solver: `Rasul` in `SpeedBambooFox`

```
Category: Cryptography
Author: Anakin
Points: 246/500
Solves: 298/959
```

### Description

> Gone with the wind, can you find my flag?
> 
> `ncat --ssl without-a-trace.chal.uiuc.tf 1337`


### Overview
In this challenge, participants interact with a server script (`server.py`) written in Python that manipulates a 5x5 matrix based on user input. The goal is to decode a flag hidden within a secret matrix derived from segments of the flag.

## Details

The server provided a 5x5 matrix \( M \) and prompted users to input values for its diagonal. Using these inputs, the server computed the trace of the product of matrix \( M \) and a secret matrix \( F \), which was derived from segments of a hidden flag. Each diagonal element of \( F \) was derived from converting chunks of the flag into long integers using the `bytes_to_long` function.

## Objective

The objective was to decode the flag encoded within matrix \( F \). This involved:
- Interacting with the server to submit various diagonal values for matrix \( M \).
- Recording the resulting trace outputs returned by the server.
- Formulating a system of linear equations using these traces.
- Solving the system of equations to deduce the numeric values of the parts of the flag encoded in matrix \( F \).
- Converting these numeric values back into bytes and decoding them to reconstruct the flag.

## Solution
### Step 1: Understanding Matrix Manipulation

The server uses the diagonal elements of the matrix \( M \) to influence the calculation of the trace of \( F \times M \). This trace is essentially the sum of the products of corresponding diagonal elements of \( F \) and \( M \):

$$ \text{trace}(F \times M) = f1 \times m1 + f2 \times m2 + f3 \times m3 + f4 \times m4 + f5 \times m5 $$

where \( f1, f2, f3, f4, f5 \) are the diagonal elements of \( F \), and \( m1, m2, m3, m4, m5 \) are the diagonal inputs provided for \( M \).

### Step 2: Interacting with the Server

The matrix \( M \) was manipulated by inputting different sets of diagonal values. For example, setting all diagonal values to 1 for simplicity in the initial tests, and varying them to systematically build a set of linear equations based on the server's trace responses.

### Step 3: Formulating Linear Equations

Each combination of inputs for \( M \) and the corresponding trace response from the server allowed us to build one equation. The coefficients of the variables in these equations were directly influenced by the values input into the diagonal of \( M \).

### Step 4: Solving the Equations

Using Python's SymPy library, we set up and solved the system of linear equations to find the numeric values of \( f1, f2, f3, f4, f5 \), each representing a segment of the flag.

### Step 5: Decoding the Flag

Each of the numeric values was converted back into bytes and then decoded to reconstruct the flag.


## Implementation Code

```python
from sympy import symbols, Eq, solve
from Crypto.Util.number import long_to_bytes

# Define symbols
f1, f2, f3, f4, f5 = symbols('f1 f2 f3 f4 f5')

# Create equations from server trace outputs
equations = [
    Eq(1*f1 + 1*f2 + 1*f3 + 1*f4 + 1*f5, 2000128101369),
    Eq(1*f1 + 2*f2 + 4*f3 + 8*f4 + 16*f5, 11852438661328),
    Eq(1*f1 + 2*f2 + 3*f3 + 4*f4 + 5*f5, 5647130221374),
    Eq(2*f1 + 3*f2 + 5*f3 + 7*f4 + 11*f5, 10730025029873),
    Eq(100*f1 + 1000*f2 + 10000*f3 + 100000*f4 + 1000000*f5, 486942258298430400)
]

# Solve the system of equations
solution = solve(equations, (f1, f2, f3, f4, f5))

# Convert numbers back to bytes and decode
f_values = [solution.get(f1), solution.get(f2), solution.get(f3), solution.get(f4), solution.get(f5)]
flag_parts = [long_to_bytes(value) for value in f_values]
flag = b''.join(flag_parts).decode()

print(f"Flag: {flag}")
```

## Decoded Flag
`uiuctf{tr4c1ng_&&_mult5!}`
