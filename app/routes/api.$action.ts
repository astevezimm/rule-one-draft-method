import {ActionFunction} from '@remix-run/node'
import {removeDraft, updateMapImage} from '~/data/data.server'

export const action: ActionFunction = async ({params, request}) => {
  switch (params.action) {
    case 'update-map-image':
      const {gameId, index, image} = await request.json()
      await updateMapImage(gameId, index, Buffer.from(image, 'base64'))
      return new Response(null, {status: 204})
    case 'remove-draft':
      const _gameId = await request.json()
      await removeDraft(_gameId)
      return new Response(null, {status: 204})
    default: return new Response(null, {status: 400, statusText: 'Bad Request'})
  }
}
