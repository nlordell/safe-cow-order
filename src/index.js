import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import { parse } from "./options.js";

const options = parse(Deno.args);

const { quote, id } = await fetch(
  `${await options.api()}/api/v1/quote`,
  {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: options.safe,
      sellToken: options.sellToken,
      buyToken: options.buyToken,
      ...options.side,
      signingScheme: "eip1271",
    }),
  },
)
  .then((response) => response.json())
  .then((json) => {
    if (json.errorType) {
      throw new Error(json.description ?? json.errorType);
    }
    return json;
  });

const { chainId } = await options.provider.getNetwork();
const orderHash = ethers.utils._TypedDataEncoder.hash(
  {
    name: "Gnosis Protocol",
    version: "v2",
    chainId,
    verifyingContract: "0x9008D19f58AAbD9eD0D60971565AA8510560ab41",
  },
  {
    Order: [
      { name: "sellToken", type: "address" },
      { name: "buyToken", type: "address" },
      { name: "receiver", type: "address" },
      { name: "sellAmount", type: "uint256" },
      { name: "buyAmount", type: "uint256" },
      { name: "validTo", type: "uint32" },
      { name: "appData", type: "bytes32" },
      { name: "feeAmount", type: "uint256" },
      { name: "kind", type: "string" },
      { name: "partiallyFillable", type: "bool" },
      { name: "sellTokenBalance", type: "string" },
      { name: "buyTokenBalance", type: "string" },
    ],
  },
  {
    ...quote,
    receiver: quote.receiver ?? ethers.constants.AddressZero,
  },
);

const owners = [...options.owners];
owners.sort((a, b) => {
  const [aa, bb] = [a.address.toLowerCase(), b.address.toLowerCase()];
  return (aa > bb) ? 1 : (aa < bb) ? -1 : 0;
});

let signature = "0x";
for (const owner of owners) {
  signature = ethers.utils.hexConcat([
    signature,
    await owner._signTypedData(
      {
        chainId,
        verifyingContract: options.safe,
      },
      {
        SafeMessage: [
          { name: "message", type: "bytes" },
        ],
      },
      { message: orderHash },
    ),
  ]);
}

const orderUid = await fetch(
  `${await options.api()}/api/v1/orders`,
  {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: options.safe,
      quoteId: id,
      ...quote,
      signingScheme: "eip1271",
      signature,
    }),
  },
)
  .then((response) => response.json())
  .then((json) => {
    if (json.errorType) {
      throw new Error(json.description ?? json.errorType);
    }
    return json;
  });

console.log(orderUid);
