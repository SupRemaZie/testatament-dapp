"server only"

import { PinataSDK } from "pinata-web3"

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.JWT}`,
  pinataGateway: `${process.env.GATEWAY}`
})