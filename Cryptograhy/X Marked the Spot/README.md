## X Marked the Spot

Solver: `Hank` in `SpeedBambooFox`

```
Category: Cryptography
Author: Anakin
Points: 93/500
Solves: 531/959
```

### Description

> A perfect first challenge for beginners. Who said pirates can't ride trains...


### Overview
In this challenge, how to encode the flag (`public.py`) and the encoding result(`ct`) is given. Our task is to decode the flag.

## Details

In public.py, the the of the flag and key is 48 and 8 respectively. The encoding process is as follows:
1. XOR the flag with the key
2. the key is repeated to match the length of the flag


## Solution
### Step 1: Understand the XOR operation
XOR function is invertible, which means that if we XOR the encoding result with the key, we can get the flag.

### Step 2: How to get the key?
We know that the first 7 words of the flag are `uiuctf{`. We can XOR `uiuctf{` and encoding result, we will get the first 7 words, which is `hdiqbfj`. 
### Step 3: Get the flag
Now we can test all the visable characters in the ASCII table(which is from 32 to 126) as the last word of key. Then just XOR it with encoding result, and we will get the flag.


## Implementation Code

```python
from itertools import cycle

with open("ct", "rb") as ct_file:
    ct = ct_file.read()

flag = b"uiuctf{????????????????????????????????????????}"
key = bytes(x ^ y for x, y in zip(ct, flag))[:7]
print(key)
for i in range(32, 127):
    new_key = key.decode() + f"{chr(i)}"
    new_key = new_key.encode()
    result = bytes(x ^ y for x, y in zip(ct, cycle(new_key)))
    if result[-1] == ord('}'):
        print(result)
        break
```

## Decoded Flag
`uiuctf{n0t_ju5t_th3_st4rt_but_4l50_th3_3nd!!!!!}`
