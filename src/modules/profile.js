import React, { useState, useEffect, useCallback } from 'react'
import { Card, Icon, Image, Grid } from 'semantic-ui-react'


function Profile(props) {
  let name = ''
  if (props.identity) {
    if (props.identity.length > 34) {
      name = props.identity.slice(0, 34) + '...'
    } else {
      name = props.identity
    }
  }

  return (<Card>
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
  </Card>)
}

export default Profile
