import {useEffect, useState} from 'react'
import {LinksFunction, LoaderFunction, LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {loadDraft} from '~/data/data.server'
import {isPlayerSelected, pageHeading, Player, playerKey, PlayerSelected} from '~/global'
import VotingPage from './VotingPage'
import BanningPage from './BanningPage'
import SnakeDraftPage from './SnakeDraftPage'
import ErrorPage from './ErrorPage'
import Players from './Players'
import styles from './draft.css?url'

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

export const loader : LoaderFunction = async ({params}: LoaderFunctionArgs) => {
  const draft = await loadDraft(params.gameId)
  if (!draft) throw new Response("", {status: 404})
  return Response.json({...draft, domain: process.env.DOMAIN})
}

type DraftPageData = {
  gameId: string
  players: Player[]
  domain: string
  port: string
}

export default function DraftPage(){
  const [playerSelected, setPlayerSelected] = useState<PlayerSelected>('loading')
  const {gameId, players, domain} = useLoaderData() as DraftPageData
  const playerSelectedKey = `${gameId}-playerSelected`
  
  const adminPlayer = players.find(player => player.admin)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(
    playerSelected === 'admin' && adminPlayer ? adminPlayer.id : null
  )
  
  useEffect(()=>{
    if (playerSelected === 'loading') {
      if (localStorage.getItem('admin') === gameId) {
        setPlayerSelected('admin')
        localStorage.setItem(playerSelectedKey, 'admin')
        localStorage.setItem("gameid", gameId)
        localStorage.setItem(playerKey(gameId), adminPlayer ? adminPlayer.id : '')
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

  useEffect(() => {
    if (['admin', 'yes'].includes(playerSelected) && !selectedPlayer) {
      setSelectedPlayer(localStorage.getItem(playerKey(gameId)))
    }
  }, [playerSelected, selectedPlayer])

  useEffect(() => {
    const seconds = 2
    setInterval(async () => {
      const response = await fetch(`/api/get-last-updated/${gameId}`)
      const data = await response.json()
      if (data.lastUpdated && (Date.now() - new Date(data.lastUpdated).getTime()) / 1000 <= seconds) {
        window.location.reload()
      }
    }, seconds * 1000)
  }, [])
  
  function handleSelectPlayer(player: Player) {
    setPlayerSelected('yes')
    setSelectedPlayer(player.id)
    localStorage.setItem(playerSelectedKey, 'yes')
    localStorage.setItem(playerKey(gameId), player.id)
  }
  
  function handleCancelSelection() {
    setPlayerSelected('no')
    setSelectedPlayer(null)
    localStorage.setItem(playerSelectedKey, 'no')
    localStorage.removeItem(playerKey(gameId))
  }
  
  return (
    <>
      <h1>{pageHeading}</h1>
      <h2>Share the current URL with players participating in the draft</h2>
      <Players
        playerSelected={playerSelected}
        selectedPlayer={selectedPlayer}
        onSelectPlayer={handleSelectPlayer}
        onCancelSelection={handleCancelSelection}
      />
      <DraftPageContent playerSelected={playerSelected} selectedPlayer={selectedPlayer} />
    </>
  )
}

export type DraftPageContentProps = {
  playerSelected: PlayerSelected
  selectedPlayer: string | null
}

function DraftPageContent(props: DraftPageContentProps)
{
  const {state} = useLoaderData() as {state: string}
  switch (state) {
    case 'voting': return <VotingPage {...props} />
    case 'banning': return <BanningPage {...props} />
    case 'drafting':
    case 'finished':
      return <SnakeDraftPage state={state} {...props} />
    default: return <ErrorPage />
  }
}
