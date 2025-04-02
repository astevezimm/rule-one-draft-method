import {LoaderFunction, LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import VotingPage from './VotingPage'
import BanningPage from './BanningPage'
import SnakeDraftPage from './SnakeDraftPage'
import ErrorPage from './ErrorPage'
import {loadDraft} from '~/data/data.server'

export const loader : LoaderFunction = async ({params}: LoaderFunctionArgs) => {
  const draft = await loadDraft(params.gameId)
  if (!draft) throw new Response("", {status: 404})
  return Response.json(draft)
}

export default function DraftPage() {
  const {state} = useLoaderData() as {state: string}
  switch (state) {
    case 'voting': return <VotingPage />
    case 'banning': return <BanningPage />
    case 'drafting': return <SnakeDraftPage />
    default: return <ErrorPage />
  }
}
