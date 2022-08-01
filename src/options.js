import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import { parse as parseFlags } from "https://deno.land/std@0.150.0/flags/mod.ts";

import { defaultApiUrl } from "./api.js";

const NAME = "safe-cow-order";
const VERSION = "0.0.1";

function apiUrl(url, provider) {
  return url !== undefined ? () => Promise.resolved(url) : async () => {
    const { chainId } = await provider.getNetwork();
    return defaultApiUrl(chainId);
  };
}

export function parse(args) {
  const flags = parseFlags(args, {
    string: [
      "api",
      "buy-amount",
      "buy-token",
      "node",
      "owner",
      "safe",
      "sell-amount",
      "sell-token",
    ],
    boolean: ["help", "version"],
    alias: { h: "help", V: "version" },
    collect: ["owner"],
  });

  if (flags.help) {
    console.log(`
${NAME} ${VERSION}

USAGE:
    ${NAME} [OPTIONS]

OPTIONS:
        --api <URL>                The base URL CoW Protocol API
        --buy-amount <AMOUNT>      The buy amount for a buy order
        --buy-token <ADDRESS>      The token to buy
    -h, --help                     Print help information
        --node <URL>               The URL of the node to use
        --owner <PRIVATE_KEY>      Private key of an owner EOA to sign with
                                   (can be specified multiple times)
        --safe <ADDRESS>           Gnosis Safe address
        --sell-amount <AMOUNT>     The sell amount for a sell order
        --sell-token <ADDRESS>     The token to sell
        --slippage <BPS>           Additional slippage for the order
    -V, --version                  Print version information
`.trim());
    Deno.exit(0);
  }

  if (flags.version) {
    console.log(`${NAME} ${VERSION}`);
    Deno.exit(0);
  }

  function opt(name) {
    const value = flags[name];
    if (value === undefined) {
      console.error(`ERROR: missing --${name} argument`);
      Deno.exit(1);
    }
    return value;
  }

  function optOneOf(...names) {
    const values = names
      .map((name) => [name, flags[name]])
      .filter(([, value]) => value !== undefined);
    if (values.length == 0) {
      const nameFlags = names.map((name) => `--${name}`).join(", ");
      console.error(`ERROR: missing one of ${nameFlags} arguments`);
      Deno.exit(1);
    }
    if (values.length > 1) {
      const nameFlags = values.map(([name]) => `--${name}`).join(", ");
      console.error(`ERROR: can only specifiy one of ${nameFlags} arguments`);
      Deno.exit(1);
    }
    return values[0];
  }

  const provider = new ethers.providers.JsonRpcProvider(opt("node"));

  const [name, amount] = optOneOf("sell-amount", "buy-amount");
  const side = name == "sell-amount"
    ? { kind: "sell", sellAmountBeforeFee: amount }
    : { kind: "buy", buyAmountAfterFee: amount };

  return {
    provider,
    api: apiUrl(flags["api"], provider),
    safe: ethers.utils.getAddress(opt("safe")),
    owners: opt("owner").map((pk) => new ethers.Wallet(pk, provider)),
    sellToken: ethers.utils.getAddress(opt("sell-token")),
    buyToken: ethers.utils.getAddress(opt("buy-token")),
    side,
    slippage: parseInt(flags["slippage"] ?? 100),
  };
}
