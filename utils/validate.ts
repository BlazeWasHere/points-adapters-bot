/**
 * Validates an Ethereum address
 * @param address The address to validate
 * @returns if the address is valid EVM address
 */
const isValidEVMAddress = (address: string): boolean => {
  if (!address || typeof address !== "string") return false;
  else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;

  return true;
};

export { isValidEVMAddress };
