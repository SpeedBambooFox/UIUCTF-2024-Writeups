## Determined

Solver: `Rasul && Partho` in `SpeedBambooFox`

```
Category: Cryptography
Author: Anakin
Points: 322/500
Solves: 222/959
```

### Description

> "It is my experience that proofs involving matrices can be shortened by 50% if one throws the matrices out."
> 
> \- Emil Artin
> 
> `ncat --ssl without-a-trace.chal.uiuc.tf 1337`


### Overview
This CTF challenge involved manipulating a 5x5 matrix on a server to extract determinant values, which were then used to determine the components of an RSA encryption key and ultimately decrypt a message.

## Details

The server script allowed us to interactively modify specific elements of a 5x5 matrix. The determinant values of this matrix, derived after each modification, were central to solving for RSA key components. Each matrix interaction provided insight into the RSA key structure involving the primes `p` and `q`, and an additional integer `r`.

## Objective

The objectives were structured as follows:
- Connect to the server and modify elements of the matrix to gather determinant values.
- Use these determinants to formulate a system of equations that encapsulate the RSA key components `p`, `q`, and `r`.
- Solve the equations to find `p` and `q`, then use these to decrypt an RSA-encrypted message and retrieve the flag.

## Solution
### Step 1: Matrix Interaction

Upon connecting to the server using `ncat`, we were prompted to input values for certain elements of the matrix while elements related to `p`, `q`, and `r` were fixed. The structure of the matrix was as follows:

$$
M = \begin{bmatrix}
p & 0 & \text{input} & 0 & \text{input} \\
0 & \text{input} & 0 & \text{input} & 0 \\
\text{input} & 0 & \text{input} & 0 & \text{input} \\
0 & q & 0 & r & 0 \\
\text{input} & 0 & \text{input} & 0 & 0
\end{bmatrix}
$$

Initially, we set all inputs to one to establish a baseline for the determinant. Subsequently, we changed each input systematically to analyze how each coefficient influenced the determinant outcome. This method aimed to cover as many cases as possible, ensuring a comprehensive system of equations could be developed, leading to a unique solution.

### Step 2: Formulation of Equations

Using the determinant values retrieved, we constructed a series of equations. The determinant of a matrix is calculated using the Leibniz formula, which involves summing the products of matrix entries where each product is multiplied by the sign of the permutation of the indices:

$$
\text{det}(M) = \sum_{\sigma \in S_5} \text{sgn}(\sigma) \prod_{i=1}^5 M_{i, \sigma(i)}
$$

Here, `S_5` represents the permutation group of the indices \{1, 2, 3, 4, 5\}. The determinant calculations allowed us to isolate and solve for the unknowns `p`, `q`, and `r`, which were strategically embedded within the matrix. By setting different input configurations and recording the determinant outputs, we formulated equations based on each permutation's contribution to the overall determinant.

### Step 3: Solving the System of Equations

Using symbolic computation tools like Python's SymPy library, we set up the equations using the actual determinant values and applied numerical methods to find solutions for the RSA key components. This process involved using the solve function in SymPy, which can handle linear and non-linear systems of equations. The complexity of the determinant expressions and their dependencies on the inputs required careful manipulation and testing of various scenarios to isolate each variable effectively.

### Step 4: RSA Decryption

After deriving the values for `p` and `q`, we proceeded with the decryption steps:
- Calculated `n = p * q` and `phi(n) = (p-1) * (q-1)`, where `phi(n)` is Euler's totient function for `n`.
- Utilized the Extended Euclidean Algorithm to find the modular multiplicative inverse `d` of the public key exponent `e` modulo `phi(n)`.
- Used the RSA decryption formula `m = c^d mod n`, where `c` is the encrypted message, to decode the message.


The final decrypted message was then converted from its numeric form back into bytes, using Python's integer to bytes conversion methods, to reveal the flag.

## Implementation Code

Finding `p`, `q` and `r`
```python
import sympy as sp
from itertools import permutations

# Define symbols for the RSA key components
p, q, r = sp.symbols('p q r')

# Function to construct the matrix based on interactive inputs
def create_matrix(a, b, c, d, e, f, g, h, i):
    return [
        [p, 0, a, 0, b],
        [0, c, 0, d, 0],
        [e, 0, f, 0, g],
        [0, q, 0, r, 0],
        [h, 0, i, 0, 0]
    ]

# Manual determinant calculation function
def calculate_determinant(M):
    size = 5
    perm_list = list(permutations(range(size)))
    determinant = 0
    for perm in perm_list:
        product = 1
        sign = (-1) ** sum(1 for i in range(size) for j in range(i + 1, size) if perm[i] > perm[j])
        for i in range(size):
            product *= M[i][perm[i]]
        determinant += sign * product
    return determinant

# Create equations based on the determinant values obtained from the server
det_results = {
    (1, 1, 1, 1, 1, 1, 1, 1, 1): 69143703864818353130371867063903344721913499237213762852365448402106351546379534901008421404055139746270928626550203483668654060066917995961156948563756758160310602854329852071039981874388564191274850542349182490083881348633205451737697677971069061869428981062350490771144358405734467651517359001029442068348,
    (2, 1, 1, 1, 1, 1, 1, 1, 1): 69143703864818353130371867063903344721913499237213762852365448402106351546379534901008421404055139746270928626550203483668654060066917995961156948563756752700538511697695076762773965531010748006659492973112024174525746367374237063293523650725957257590333321191693876781172827116596771133374732236966118301362,
    (2, 2, 1, 1, 1, 1, 1, 1, 1): 69143703864818353130371867063903344721913499237213762852365448402106351546379534901008421404055139746270928626550203483668654060066917995961156948563756752700538511697695076762773965531010748006659492973112024174525746367374237063293523650725957257590333321191693876781172827116596771133374732236966118301362,
    (2, 2, 2, 1, 1, 1, 1, 1, 1): -20507228971116216520532192348387428412930727130252865244433881346657061233264632589951133278253086042176373261041141001240445189387352296505922127124480309081310365945024266109051535551540436415768892783648668642826024372527391449445755275140224684824434455601215576822636052704854881258842820871604210553369,
    (2, 2, 2, 2, 1, 1, 1, 1, 1): 138287407729636706260743734127806689443826998474427525704730896804212703092759069802016842808110279492541857253100406967337308120133835991922313897127513505401077023395390153525547931062021496013318985946224048349051492734748474126587047301451914515180666642383387753562345654233193542266749464473932236602724,
    (2, 2, 2, 2, 2, 1, 1, 1, 1): 138287407729636706260743734127806689443826998474427525704730896804212703092759069802016842808110279492541857253100406967337308120133835991922313897127513483561988658768851052292483865688510231274857555669275415086818952809712600572810351192471467298064284002900761297602459529076642756194178957417678941534780,
    (2, 2, 2, 2, 2, 2, 1, 1, 1): 138287407729636706260743734127806689443826998474427525704730896804212703092759069802016842808110279492541857253100406967337308120133835991922313897127513505401077023395390153525547931062021496013318985946224048349051492734748474126587047301451914515180666642383387753562345654233193542266749464473932236602724,
    (2, 2, 2, 2, 2, 2, 2, 1, 1): 276574815459273412521487468255613378887653996948855051409461793608425406185518139604033685616220558985083714506200813934674616240267671983844627794255027010802154046790780307051095862124042992026637971892448096698102985469496948253174094602903829030361333284766775507124691308466387084533498928947864473205448,
    (2, 2, 2, 2, 2, 2, 2, 2, 1): 276574815459273412521487468255613378887653996948855051409461793608425406185518139604033685616220558985083714506200813934674616240267671983844627794255027010802154046790780307051095862124042992026637971892448096698102985469496948253174094602903829030361333284766775507124691308466387084533498928947864473205448,
    (2, 2, 2, 2, 2, 2, 2, 2, 2): 553149630918546825042974936511226757775307993897710102818923587216850812371036279208067371232441117970167429012401627869349232480535343967689255588510054021604308093581560614102191724248085984053275943784896193396205970938993896506348189205807658060722666569533551014249382616932774169066997857895728946410896,

}
equations = []
for values, det in det_results.items():
    M = create_matrix(*values)
    calculated_det = calculate_determinant(M)
    equations.append(sp.Eq(calculated_det, det))

# Solve the system of equations for p, q, r
solution = sp.solve(equations, (p, q, r), dict=True)

# Output the solutions
print("Solutions of the system of equations:")
for sol in solution:
    print(sol)
```

Flag decoding
```python
import sympy as sp

# Use the found values ​​of p and q
p = 12664210650260034332394963174199526364356188908394557935639380180146845030597260557316300143360207302285226422265688727606524707066404145712652679087174119
q = 12538849920148192679761652092105069246209474199128389797086660026385076472391166777813291228233723977872612370392782047693930516418386543325438897742835129

# RSA data
n = 158794636700752922781275926476194117856757725604680390949164778150869764326023702391967976086363365534718230514141547968577753309521188288428236024251993839560087229636799779157903650823700424848036276986652311165197569877428810358366358203174595667453056843209344115949077094799081260298678936223331932826351
e = 65535
c = 72186625991702159773441286864850566837138114624570350089877959520356759693054091827950124758916323653021925443200239303328819702117245200182521971965172749321771266746783797202515535351816124885833031875091162736190721470393029924557370228547165074694258453101355875242872797209141366404264775972151904835111

# Calculate phi(n)
phi_n = (p - 1) * (q - 1)
# Calculate d
d = pow(e, -1, phi_n)
# Decrypt c
m = pow(c, d, n)

# Convert number back to bytes and decode to string
try:
    flag = m.to_bytes((m.bit_length() + 7) // 8, byteorder='big').decode()
except:
    flag = "ah shit, try again ):"

print("Flag:", flag)
```


## Decoded Flag
`uiuctf{h4rd_w0rk_&&_d3t3rm1n4t10n}`
