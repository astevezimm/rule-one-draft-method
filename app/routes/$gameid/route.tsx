import {LoaderFunction} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import VotingPage from './VotingPage'
import BanningPage from './BanningPage'
import SnakeDraftPage from './SnakeDraftPage'
import ErrorPage from './ErrorPage'

export const loader : LoaderFunction = async () => {
  
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
