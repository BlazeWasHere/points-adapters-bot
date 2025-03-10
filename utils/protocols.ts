const URLS: Record<string, string> = {
  avalon: "https://app.avalonfinance.xyz/points",
  astherus: "https://www.astherus.finance/en/stage1/team",
  bedrock: "https://app.bedrock.technology",
  corn: "https://usecorn.com/app",
  dolomite: "https://app.dolomite.io/balances",
  etherfi: "https://app.ether.fi",
  gravityfinance: "https://gravityfinance.io/rewards",
  henlo: "https://app.henlo.com",
  karak: "https://app.karak.network/portfolio",
  kelpdao: "https://kelpdao.xyz/defi",
  lombard: "https://www.lombard.finance/app/dashboard",
  methprotocol: "https://app.methprotocol.xyz/campaigns/methamorphosis-s2",
  ramen: "https://app.ramen.finance/stake",
  resolv: "https://app.resolv.xyz/points",
  rings: "https://app.rings.money/#/points",
  solv: "https://app.solv.finance/points",
  sonic: "https://my.soniclabs.com/points",
  superform: "https://www.superform.xyz/cred/",
  swapsio: "https://swaps.io/",
  symbiotic: "https://app.symbiotic.fi/dashboard/positions",
  syrup: "https://syrup.fi/portfolio",
  treehouse: "https://app.treehouse.finance/portfolio",
  veda: "https://app.veda.tech/points",
};

const getProtocolUrl = (protocol: string): string => {
  return URLS[protocol.toLowerCase()] || "";
};

export { getProtocolUrl };
