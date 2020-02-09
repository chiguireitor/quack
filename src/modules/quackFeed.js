import React from 'react'
import { Grid, Segment, Card, Button, Icon, Image } from 'semantic-ui-react'

function QuackFeed(props) {
  let name = ''
  if (props.identity) {
    if (props.identity.length > 16) {
      name = props.identity.slice(0, 16) + '...'
    } else {
      name = props.identity
    }
  }

  return (<Grid columns='equal'>
    <Grid.Column only='computer'>
      <Card>
        <Image src='./avatars/hacktivist.png' wrapped ui={false} />
        <Card.Content>
          <Card.Header>{name}</Card.Header>
          <Card.Meta>
            <span className='date'>Joined in 2019</span>
          </Card.Meta>
          <Card.Description>
            Cypherpunk of the darkweb, dealing plumbuses.
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Grid columns='equal'>
            <Grid.Column>
              <Icon name='comment' />
              10
            </Grid.Column>

            <Grid.Column>
              <Icon name='user' />
              22
            </Grid.Column>

            <Grid.Column>
              <Icon name='eye' />
              100
            </Grid.Column>
          </Grid>
        </Card.Content>
      </Card>
    </Grid.Column>
    <Grid.Column computer={8} mobile={16}>
      <Segment.Group raised>
        {new Array(props.items.length).fill(0).map((x, idx) => {
          let qck = props.items[idx]

          return (<Segment key={idx}>
            <Grid columns='equal'>
              <Grid.Column width={2}>
                <Image src='./avatars/hacktivist.png' width={64} circular/>
              </Grid.Column>
              <Grid.Column>
                <Grid.Row columns='equal'>
                  <Grid.Column>
                    <small>{qck.envelope.identity} quacked on {(new Date(qck.envelope.message.ts)).toUTCString()}</small>
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                  <Grid.Column>
                    {qck.envelope.message.text}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row columns='equal'>
                  <Grid.Column>

                  </Grid.Column>

                  <Grid.Column float='right' textAlign='right'>
                    <Button.Group size='tiny' basic>
                      <Button icon='comment outline'></Button>
                      <Button icon='retweet'></Button>
                      <Button icon='fire'></Button>
                      <Button icon='send'></Button>
                    </Button.Group>
                  </Grid.Column>
                </Grid.Row>
              </Grid.Column>
            </Grid>
          </Segment>)
        })}
      </Segment.Group>
    </Grid.Column>
    <Grid.Column only='computer'>
      <Segment>
      </Segment>
    </Grid.Column>
  </Grid>)
}

export default QuackFeed
