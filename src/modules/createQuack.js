import React, { useState } from 'react'
import { Modal, Button, Icon, Form, TextArea } from 'semantic-ui-react'

function CreateQuack(props) {
  const [quackText, setQuackText] = useState('')

  return (<Modal open={props.open}>
    <Modal.Header>
      Send a new Quack!
    </Modal.Header>

    <Modal.Content>
      <Form>
        <TextArea value={quackText} onChange={(e, {value}) => setQuackText(value)}/>
      </Form>
    </Modal.Content>

    <Modal.Actions>
      <Button negative onClick={() => props.onCancel()}>Cancel <Icon name='cancel'/></Button>
      <Button positive onClick={() => props.onSend({text: quackText})}>Send <Icon name='send'/></Button>
    </Modal.Actions>
  </Modal>)
}

export default CreateQuack
