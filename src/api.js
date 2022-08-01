export function defaultApiUrl(chainId) {
  const barn = "https://barn.api.cow.fi";
  switch (chainId) {
    case 1:
      return `${barn}/mainnet`;
    case 4:
      return `${barn}/rinkeby`;
    case 5:
      return `${barn}/goerli`;
    case 100:
      return `${barn}/xdai`;
    default:
      return `http://localhost:8080`;
  }
}

export async function checkJsonError(response) {
  if (response.ok) {
    return await response.json();
  }

  const body = await response.text();
  let message;
  try {
    const { errorType, description } = JSON.parse(body);
    message = description ?? errorType ?? body;
  } catch {
    message = body;
  }

  throw new Error(message);
}
