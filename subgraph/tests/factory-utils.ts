import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  FLIPCreated,
  FLIPCrossChainCreated,
  SetGasLimit,
  SetGateway,
  SetUniversal
} from "../generated/Factory/Factory"

export function createFLIPCreatedEvent(
  creator: Address,
  flipAddress: Address,
  priceAddress: Address,
  name: string,
  symbol: string,
  initialPrice: BigInt,
  maxSupply: BigInt,
  maxPrice: BigInt,
  creatorFeePercent: BigInt,
  baseUri: string
): FLIPCreated {
  let flipCreatedEvent = changetype<FLIPCreated>(newMockEvent())

  flipCreatedEvent.parameters = new Array()

  flipCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "flipAddress",
      ethereum.Value.fromAddress(flipAddress)
    )
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "priceAddress",
      ethereum.Value.fromAddress(priceAddress)
    )
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol))
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "initialPrice",
      ethereum.Value.fromUnsignedBigInt(initialPrice)
    )
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSupply",
      ethereum.Value.fromUnsignedBigInt(maxSupply)
    )
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxPrice",
      ethereum.Value.fromUnsignedBigInt(maxPrice)
    )
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "creatorFeePercent",
      ethereum.Value.fromUnsignedBigInt(creatorFeePercent)
    )
  )
  flipCreatedEvent.parameters.push(
    new ethereum.EventParam("baseUri", ethereum.Value.fromString(baseUri))
  )

  return flipCreatedEvent
}

export function createFLIPCrossChainCreatedEvent(
  creator: Address,
  flipAddress: Address,
  priceAddress: Address,
  name: string,
  symbol: string,
  initialPrice: BigInt,
  maxSupply: BigInt,
  maxPrice: BigInt,
  creatorFeePercent: BigInt,
  baseUri: string,
  gatewayAddress: Address,
  gasLimit: BigInt,
  supportMint: boolean
): FLIPCrossChainCreated {
  let flipCrossChainCreatedEvent =
    changetype<FLIPCrossChainCreated>(newMockEvent())

  flipCrossChainCreatedEvent.parameters = new Array()

  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "flipAddress",
      ethereum.Value.fromAddress(flipAddress)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "priceAddress",
      ethereum.Value.fromAddress(priceAddress)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString(symbol))
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "initialPrice",
      ethereum.Value.fromUnsignedBigInt(initialPrice)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxSupply",
      ethereum.Value.fromUnsignedBigInt(maxSupply)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "maxPrice",
      ethereum.Value.fromUnsignedBigInt(maxPrice)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "creatorFeePercent",
      ethereum.Value.fromUnsignedBigInt(creatorFeePercent)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam("baseUri", ethereum.Value.fromString(baseUri))
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "gatewayAddress",
      ethereum.Value.fromAddress(gatewayAddress)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "gasLimit",
      ethereum.Value.fromUnsignedBigInt(gasLimit)
    )
  )
  flipCrossChainCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "supportMint",
      ethereum.Value.fromBoolean(supportMint)
    )
  )

  return flipCrossChainCreatedEvent
}

export function createSetGasLimitEvent(
  flip: Address,
  gasLimit: BigInt
): SetGasLimit {
  let setGasLimitEvent = changetype<SetGasLimit>(newMockEvent())

  setGasLimitEvent.parameters = new Array()

  setGasLimitEvent.parameters.push(
    new ethereum.EventParam("flip", ethereum.Value.fromAddress(flip))
  )
  setGasLimitEvent.parameters.push(
    new ethereum.EventParam(
      "gasLimit",
      ethereum.Value.fromUnsignedBigInt(gasLimit)
    )
  )

  return setGasLimitEvent
}

export function createSetGatewayEvent(
  flip: Address,
  gateway: Address
): SetGateway {
  let setGatewayEvent = changetype<SetGateway>(newMockEvent())

  setGatewayEvent.parameters = new Array()

  setGatewayEvent.parameters.push(
    new ethereum.EventParam("flip", ethereum.Value.fromAddress(flip))
  )
  setGatewayEvent.parameters.push(
    new ethereum.EventParam("gateway", ethereum.Value.fromAddress(gateway))
  )

  return setGatewayEvent
}

export function createSetUniversalEvent(
  flip: Address,
  universal: Address
): SetUniversal {
  let setUniversalEvent = changetype<SetUniversal>(newMockEvent())

  setUniversalEvent.parameters = new Array()

  setUniversalEvent.parameters.push(
    new ethereum.EventParam("flip", ethereum.Value.fromAddress(flip))
  )
  setUniversalEvent.parameters.push(
    new ethereum.EventParam("universal", ethereum.Value.fromAddress(universal))
  )

  return setUniversalEvent
}
