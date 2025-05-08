import {ActionFunction} from '@remix-run/node'
import {removeDraft, updateMapImage, vote} from '~/data/data.server'

export const action: ActionFunction = async ({params, request}) => {
  switch (params.action) {
    case 'update-map-image':
      const {gameId: updateMapGameId, index, image} = await request.json()
      await updateMapImage(updateMapGameId, index, Buffer.from(image, 'base64'))
      return new Response(null, {status: 204})
    case 'remove-draft':
      const removeDraftGameId = await request.json()
      await removeDraft(removeDraftGameId)
      return new Response(null, {status: 204})
    case 'vote':
      const {gameId: voteGameId, player, mapIndex} = await request.json()
      await vote(voteGameId, player, mapIndex)
      return new Response(null, {status: 204})
    default: return new Response(null, {status: 400, statusText: 'Bad Request'})
  }
}
