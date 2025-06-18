import {LoaderFunction} from '@remix-run/node'
import {getLastUpdated} from '~/data/data.server'

export const loader: LoaderFunction = async ({params, request}) => {
  if (params.gameId) {
    const lastUpdated = await getLastUpdated(params.gameId)
    return new Response(JSON.stringify({lastUpdated}), {
      headers: { 'Content-Type': 'application/json' }
    })
  }
  return new Response(null, {status: 400, statusText: 'Bad Request'})
}
