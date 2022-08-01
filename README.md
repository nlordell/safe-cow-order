# Safe CowSwap Orders

This repo provides a script for demonstrating how Gnosis Safe can place gasless orders on CowSwap.
This is not intended to be fully featured, but instead just to demonstrate how off-chain orders can be placed for a Gnosis Safe.

## Requirements

- Gnosis Safe v1.3 or later with the `CompatibilityFallbackHandler` installed (this is the default fallback handler).
- Deno

## Running

```sh
deno run src/index.js \
  --node https://mainnet.infura.io/v3/$INFURA_PROJECT_ID \
  --buy-token 0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB \
  --sell-token 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 \
  --sell-amount 1000000000000000000 \
  --safe $SAFE_ADDRESS \
  --owner $OWNER_0_PK \
  --owner $OWNER_1_PK
```

## Building

You can optionally created bundled executables (instead of invoking Deno).

```sh
make # build a bundled executable
make xcompile # cross-compile bundled executables
```

This allows you to run the script with `target/safe-cow-order ...`.
