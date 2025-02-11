const URLS: Record<string, string> = {
  avalon: "https://app.avalonfinance.xyz/points",
  bedrock: "https://app.bedrock.technology",
  corn: "https://usecorn.com/app",
  dolomite: "https://app.dolomite.io/balances",
  etherfi: "https://app.ether.fi",
  gravityfinance: "https://gravityfinance.io/rewards",
  henlo: "https://app.henlo.com",
  kelpdao: "https://kelpdao.xyz/defi",
  lombard: "https://www.lombard.finance/app/dashboard",
  ramen: "https://app.ramen.finance/stake",
  resolv: "https://app.resolv.xyz/points",
  solv: "https://app.solv.finance/points",
  sonic: "https://my.soniclabs.com/points",
  symbiotic: "https://app.symbiotic.fi/dashboard/positions",
  syrup: "https://syrup.fi/portfolio",
  treehouse: "https://app.treehouse.finance/portfolio",
  veda: "https://app.veda.tech/points",
};

const getProtocolUrl = (protocol: string): string => {
  return URLS[protocol.toLowerCase()] || "";
};

export { getProtocolUrl };
