import React, { useState } from 'react'
import { Modal, Button, Icon, Form, Input } from 'semantic-ui-react'

function UnlockSeed(props) {
  const [inputType/*, setInputType*/] = useState('password')
  const [password, setPassword] = useState('')

  return (<Modal open={props.open}>
    <Modal.Header>
      Unlock your seed
    </Modal.Header>

    <Modal.Content>
      <Form>
        <Input type={inputType} placeholder='Input your password' value={password} onChange={(e, {value}) => setPassword(value)}/>
      </Form>
    </Modal.Content>

    <Modal.Actions>
      <Button negative onClick={() => props.onCancel()}>Cancel <Icon name='cancel'/></Button>
      <Button positive onClick={() => props.onUnlock(password)}>Unlock <Icon name='unlock alternate'/></Button>
    </Modal.Actions>
  </Modal>)
}

export default UnlockSeed
