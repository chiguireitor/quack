import React, { useState, useEffect, useCallback } from 'react'
import { Container, Grid, Menu, Icon, Button, Input, Image, Label } from 'semantic-ui-react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'
import * as bip38 from 'bip38'
import { fromSeed } from 'bip32'
import { DERIVATION_PATH } from './consts'
import * as bitcoin from 'bitcoinjs-lib'
import Peer from 'simple-peer'

import 'semantic-ui-css/semantic.min.css'
import './App.css'

import AccountCreation from './modules/accountCreation'
import CreateQuack from './modules/createQuack'
import UnlockSeed from './modules/unlockSeed'
import QuackFeed from './modules/quackFeed'
import Profile from './modules/profile'

import * as util from './util'

PouchDB.plugin(PouchDBFind)

const db = new PouchDB('quack')
const peers = new PouchDB('peers')

const peerConnections = []

function start() {
  let repl = peers.replicate.to('http://quacker:quacker@etb.chiguireitor.rocks:5984/quack', {
    live: true, retry: true
  })
  repl.on('change', console.log)
  repl.on('complete', console.log)
  repl.on('active', console.log)
  repl.on('paused', console.log)
  repl.on('denied', console.log)
  repl.on('error', console.log)

  let replFrom = peers.replicate.from('http://quacker:quacker@etb.chiguireitor.rocks:5984/quack', {
    live: true, retry: true
  })
  replFrom.on('change', console.log)
  replFrom.on('complete', console.log)
  replFrom.on('active', console.log)
  replFrom.on('paused', console.log)
  replFrom.on('denied', console.log)
  replFrom.on('error', console.log)

  let p = new Peer({initiator: true})
  p.on('signal', async (data) => {
    if (data.type !== 'offer') {
      return
    }

    let id = localStorage.getItem('_default_identity_')

    let prevData

    try {
      prevData = await peers.get(`peerdata_${id}`)

      prevData.data = data
    } catch (e) {
      prevData = {
        _id: `peerdata_${id}`,
        data
      }
    }

    peers.put(prevData)
  })
  p.on('error', console.log)
  peerConnections.push(p)

  peers.createIndex({ index: { fields: ['_id'] } })
}

start()

function App() {
  const [currentIdentity/*, setCurrentIdentity*/] = useState(localStorage.getItem('_default_identity_'))
  const [isAccountCreationOpen, setAccountCreationOpen] = useState(currentIdentity === null)
  const [isProfileMissing, setProfileMissing] = useState(false)
  const [isCreateQuackWindowOpen, setCreateQuackWindowOpen] = useState(false)
  const [isUnlockSeedWindowOpen, setUnlockSeedWindowOpen] = useState(false)
  const [currentQuack, setCurrentQuack] = useState(null)
  const [quackList, setQuackList] = useState([])
  const [search, setSearch] = useState('')

  const updateList = useCallback((additional) => {
    setQuackList(additional.concat(quackList))
  }, [quackList])

  useEffect(() => {
    const checkIdentity = async () => {
      if (currentIdentity) {
        try {
          let profile = await db.get(`_identity_${currentIdentity}`)
          console.log('profile->', profile)
        } catch(e) {
          if (e.status === 404) {
            setProfileMissing(true)
          }
        }
      }
    }

    let changes = db.changes({
      live: true, include_docs: true, limit: 100, descending: true
    })
    let lastChanges = []
    let updateTimeout = null
    changes.on('change', (ch) => {
      lastChanges.push(ch.doc)
      if (updateTimeout) {
        clearTimeout(updateTimeout)
      }

      updateTimeout = setTimeout(() => {
        console.log('Change!')
        updateTimeout = null
        lastChanges = lastChanges.sort((a,b) => b.envelope.message.ts - a.envelope.message.ts)
        /*lastChanges = lastChanges.concat(quackList)
        console.log('lastChanges->', lastChanges, quackList)
        setQuackList(lastChanges)*/
        updateList(lastChanges.concat(quackList))
        lastChanges = []
      }, 200)
    })

    setImmediate(checkIdentity)
  }, [])

  const sendQuack = async (ops) => {
    setCreateQuackWindowOpen(false)
    let decryptedSeedHex = sessionStorage.getItem('_decrypted_seed_')
    if (!decryptedSeedHex) {
      setUnlockSeedWindowOpen(true)
      setCurrentQuack(ops)
    } else {
      const root = fromSeed(Buffer.from(decryptedSeedHex))
      const path = DERIVATION_PATH + '0'
      const child = root.derivePath(path)
      const address = bitcoin.payments.p2pkh({ pubkey: child.publicKey }).address
      const ts = Date.now()
      ops.ts = ts

      let envelope = util.signMessage(address, child, ops)

      try {
        let response = await db.put({
          _id: `quack_${address}_${ts}`,
          envelope
        })

        console.log('response->', response)
      } catch(e) {
        console.log('Error:', e)
      }
    }
  }

  const unlockSeed = (password) => {
    let seed = localStorage.getItem('_seed_')
    let decryptedKey = bip38.decrypt(seed, password, (status) => {

    })
    console.log(decryptedKey, currentQuack)
    setUnlockSeedWindowOpen(false)
  }

  const changeSearch = async (e, { value }) => {
    setSearch(value)
    console.log(peers)
    let matched = await peers.find({
      selector: { $regex: `peerdata_${value}.*` },
      fields: ['_id'],
      sort: ['_id']
    })
    console.log(matched)
  }

  return (
    <Router>
      <Container>
        <Grid>
          <Grid.Column width={16} only='computer'>
            <Menu>
              <Menu.Item><Image src={'./logo192.png'} height={32}/></Menu.Item>
              <Menu.Item as={Link} to='/'><Icon name='home'/>&nbsp;Home</Menu.Item>
              <Menu.Item as={Link} to='/notifications'><Icon name='bell'/>&nbsp;Notifications</Menu.Item>
              <Menu.Item as={Link} to='/messages'><Icon name='envelope'/>&nbsp;Messages</Menu.Item>

              <Menu.Menu position='right'>
                <Menu.Item>
                  <Input icon='search' placeholder='Search here' onChange={changeSearch} value={search}/>
                </Menu.Item>

                <Menu.Item as={Link} to='/profile' style={{ background: 'url(./avatars/hacktivist.png)', backgroundSize: '64px auto', width: '64px' }}>
                  {isProfileMissing && <Label className='notificationDot' color='red' corner size='small' empty circular/>}
                </Menu.Item>

                <Menu.Item>
                  <Button color='blue' onClick={() => setCreateQuackWindowOpen(true)}>Quack!</Button>
                </Menu.Item>
              </Menu.Menu>
            </Menu>
          </Grid.Column>

          <Grid.Column width={16} only='mobile'>
            <Menu>
              <Menu.Item><Image src={'./logo192.png'} height={16}/></Menu.Item>
              <Menu.Item as={Link} to='/'><Icon name='home'/></Menu.Item>
              <Menu.Item as={Link} to='/notifications'><Icon name='bell'/></Menu.Item>
              <Menu.Item as={Link} to='/messages'><Icon name='envelope'/></Menu.Item>
              <Menu.Item><Icon name='search'/></Menu.Item>
              <Menu.Item as={Link} to='/profile' style={{ background: 'url(./avatars/hacktivist.png)', backgroundSize: '64px auto', width: '64px' }}>
                {isProfileMissing && <Label className='notificationDot' color='red' corner size='small' empty circular/>}
              </Menu.Item>
              <Menu.Item>
                <Button color='blue' onClick={() => setCreateQuackWindowOpen(true)} compact icon='send'/>
              </Menu.Item>
            </Menu>
          </Grid.Column>
        </Grid>

        <Switch>
          <Route exact path='/' render={() => <QuackFeed items={quackList} identity={currentIdentity} />}/>
          <Route path='/profile' render={() => <Profile identity={currentIdentity} />}/>
        </Switch>

        <AccountCreation
          open={isAccountCreationOpen}
          onCancelClick={() => setAccountCreationOpen(false)}
          onAccountCreated={() => setAccountCreationOpen(false)} />

        <CreateQuack
          open={isCreateQuackWindowOpen}
          onCancel={() => setCreateQuackWindowOpen(false)}
          onSend={sendQuack}/>

        <UnlockSeed
          open={isUnlockSeedWindowOpen}
          onCancel={() => setUnlockSeedWindowOpen(false)}
          onUnlock={unlockSeed} />
      </Container>
    </Router>
  )
}

export default App
