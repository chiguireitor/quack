import React, { useState, useEffect } from 'react'
import { Modal, Button, Icon, Segment, Input } from 'semantic-ui-react'
import { generateMnemonic, mnemonicToSeedSync } from 'bip39'
import * as bip38 from 'bip38'
import { fromSeed } from 'bip32'
import * as bitcoin from 'bitcoinjs-lib'

import { DERIVATION_PATH } from '../consts'

function AccountCreation(props) {
  const [creationStep, setCreationStep] = useState(0)
  const [seedHidden, setSeedHidden] = useState(true)
  const [seed, setSeed] = useState(null)
  const [password, setPassword] = useState(null)
  const [repeatPassword, setRepeatPassword] = useState(null)
  const [hasCheckedSeed, setHasCheckedSeed] = useState(false)
  const [isPasswordOk, setPasswordOk] = useState(false)

  useEffect(() => {
    // Init
  }, [])

  function generateSeed() {
    setSeed(generateMnemonic())
  }

  useEffect(() => {
    setPasswordOk(password === repeatPassword)
  }, [password, repeatPassword])

  function saveAccount() {
    const seedPre = mnemonicToSeedSync(seed)
    const seedBuf = Buffer.from(seedPre, 'hex')

    const root = fromSeed(seedBuf)
    const path = DERIVATION_PATH + '0'
    const child = root.derivePath(path)
    const address = bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address

    sessionStorage.setItem('_decrypted_seed_', root.privateKey.toString('hex'))
    localStorage.setItem('_seed_', bip38.encrypt(root.privateKey, root.compressed, password))
    localStorage.setItem('_default_identity_', address)
    props.onCancelClick()
  }

  return (
    <Modal open={props.open} dimmer='inverted'>
      <Modal.Header>Account creation</Modal.Header>

      {creationStep === 0 && <Modal.Content>
        <p>Quack! needs to create an account, you will need to backup a list of words
        called "seed" to restore your identity (a lot like cryptocurrencies).</p>
        <p>If you're not prepared for this, you can peek around without an account.</p>
      </Modal.Content>}
      {creationStep === 0 && <Modal.Actions>
        <Button color='yellow' onClick={props.onCancelClick}>Peek around</Button>
        <Button positive onClick={() => {
          generateSeed()
          setCreationStep(1)
        }}>Go on <Icon name='chevron right'/></Button>
      </Modal.Actions>}


      {creationStep === 1 && <Modal.Content>
        <p>These are your 12 words, store them safely on an offline place.</p>

        <Segment textAlign='center'>
          <Button icon={seedHidden?'eye':'eye slash'} onClick={() => {
            setHasCheckedSeed(true)
            setSeedHidden(!seedHidden)
          }}/>
          {seedHidden && <span>************************************************************************************************************</span>}
          {!seedHidden && <span>{seed}</span>}
        </Segment>

        <p>Don't share your seed with anyone! This, along with your password, can be used to completely impersonate you!</p>
        <p>Once you're done, click next to setup a password for your seed.</p>
      </Modal.Content>}
      {creationStep === 1 && <Modal.Actions>
        <Button color='yellow' onClick={props.onCancelClick}>I'd rather peek around</Button>
        <Button positive onClick={() => setCreationStep(2)} disabled={!hasCheckedSeed}>Set password <Icon name='chevron right'/></Button>
      </Modal.Actions>}


      {creationStep === 2 && <Modal.Content>
        Choose a strong password (preferably a passphrase you only know with several words).

        <p><Input type='password' placeholder='Input your password' value={password} onChange={(e, {value}) => setPassword(value)} /></p>
        <p><Input type='password' placeholder='Repeat your password' value={repeatPassword} onChange={(e, {value}) => setRepeatPassword(value)} /></p>

        Once you're done, click on "Save your account" to save your seed. It will take some time and the browser may be unresponsive for a bit.
      </Modal.Content>}
      {creationStep === 2 && <Modal.Actions>
        <Button color='yellow' onClick={props.onCancelClick}>I've chickened out, let me peek around</Button>
        <Button positive disabled={!isPasswordOk} onClick={() => {
          saveAccount()
          setCreationStep(3)
        }}>Save your account <Icon name='save'/></Button>
      </Modal.Actions>}

      {creationStep === 3 && <Modal.Content>

      </Modal.Content>}
      {creationStep === 3 && <Modal.Actions>
        <Button positive onClick={props.onAccountCreated}>Close <Icon name='close'/></Button>
      </Modal.Actions>}
    </Modal>
  )
}

export default AccountCreation
