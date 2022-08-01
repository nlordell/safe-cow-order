export function sortByAddress(wallets) {
  return [...wallets].sort((a, b) => {
    const [aa, bb] = [a.address.toLowerCase(), b.address.toLowerCase()];
    return (aa > bb) ? 1 : (aa < bb) ? -1 : 0;
  });
}
