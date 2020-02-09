import * as bitcoinMessage from 'bitcoinjs-message'

export function signMessage(identity, keyPair, ops) {
  let message = JSON.stringify(ops)
  let signature = bitcoinMessage.sign(message, keyPair.privateKey, keyPair.compressed)

  let envelope = {
    message: ops,
    identity, signature: signature.toString('base64')
  }

  return envelope
}
