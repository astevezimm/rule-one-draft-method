import {ActionFunction} from '@remix-run/node'
import {removeDraft, submitBans, submitVoting, updateMapImage, vote} from '~/data/data.server'

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
      const {gameId: voteGameId, player: votePlayer, mapIndex} = await request.json()
      await vote(voteGameId, votePlayer, mapIndex)
      return new Response(null, {status: 204})
    case 'submit-bans':
      const {gameId: submitBansGameId, player: banPlayer, bans} = await request.json()
      await submitBans(submitBansGameId, banPlayer, bans)
      return new Response(null, {status: 204})
    case 'submit-voting':
      const {gameId: submitVotingGameId, breakTie} = await request.json()
      if (breakTie) {
        await vote(submitVotingGameId, breakTie.player, breakTie.mapIndex, true)
      }
      await submitVoting(submitVotingGameId)
      return new Response(null, {status: 204})
    default: return new Response(null, {status: 400, statusText: 'Bad Request'})
  }
}
