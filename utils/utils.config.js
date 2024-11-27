import { PinataSDK } from "pinata";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY_URL = import.meta.env.VITE_PINATA_GATEWAY_URL;

export const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY_URL,
});
