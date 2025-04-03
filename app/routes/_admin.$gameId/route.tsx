import {useEffect, useState} from 'react'
import {LoaderFunction, LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {loadDraft} from '~/data/data.server'
import {isPlayerSelected, pageHeading, PlayerSelected} from '~/global'
import {useAdmin} from '~/routes/_admin'
import VotingPage from './VotingPage'
import BanningPage from './BanningPage'
import SnakeDraftPage from './SnakeDraftPage'
import ErrorPage from './ErrorPage'
import Players from './Players'

export const loader : LoaderFunction = async ({params}: LoaderFunctionArgs) => {
  const draft = await loadDraft(params.gameId)
  if (!draft) throw new Response("", {status: 404})
  return Response.json(draft)
}

export default function DraftPage(){
  const [playerSelected, setPlayerSelected] = useState<PlayerSelected>('loading')
  const {gameId} = useLoaderData() as {gameId: string}
  const playerSelectedKey = `${gameId}-playerSelected`
  const {admin} = useAdmin()
  
  useEffect(()=>{
    if (playerSelected === 'loading') {
      if (admin) {
        setPlayerSelected('yes')
        localStorage.setItem(playerSelectedKey, 'yes')
        localStorage.setItem("gameid", gameId)
      }
      else {
        const localPlayerSelected = localStorage.getItem(playerSelectedKey)
        if (isPlayerSelected(localPlayerSelected)) setPlayerSelected(localPlayerSelected)
        else {
          setPlayerSelected('no')
          localStorage.setItem(playerSelectedKey, 'no')
        }
      }
    }
  }, [])
  
  function handleSelectPlayer() {
    setPlayerSelected('yes')
    localStorage.setItem(playerSelectedKey, 'yes')
  }
  
  return (
    <>
      <h1>{pageHeading}</h1>
      <Players playerSelected={playerSelected} onSelectPlayer={handleSelectPlayer} />
      <DraftPageContent playerSelected={playerSelected} />
    </>
  )
}

function DraftPageContent({playerSelected}: {playerSelected: PlayerSelected})
{
  const {state} = useLoaderData() as {state: string}
  switch (state) {
    case 'voting': return <VotingPage playerSelected={playerSelected} />
    case 'banning': return <BanningPage playerSelected={playerSelected} />
    case 'drafting': return <SnakeDraftPage playerSelected={playerSelected} />
    default: return <ErrorPage />
  }
}
