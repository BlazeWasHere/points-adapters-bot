const INVALID_PROTOCOL_ERROR = "Please provide a protocol!";
const INVALID_ADDRESS_ERROR = "Please provide an address!";

const displayAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const invalidEVMAddressError = (address: string) =>
  `'${address}' is an invalid EVM address`;

const invalidProtocolError = (protocol: string) =>
  `Protocol '${protocol}' not found.`;

export {
  INVALID_PROTOCOL_ERROR,
  invalidEVMAddressError,
  INVALID_ADDRESS_ERROR,
  invalidProtocolError,
  displayAddress,
};
