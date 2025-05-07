import {useEffect, useState} from 'react'
import {ActionFunctionArgs, redirect} from '@remix-run/node'
import {startDraft} from '~/data/data.server'
import { LinksFunction } from "@remix-run/node"
import styles from "./start_page.css?url"
import StartDraftForm from './StartDraftForm'
import ContinueDraftForm from './ContinueDraftForm'
import {pageHeading} from '~/global'

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }]
}

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData()
  const body = Object.fromEntries(formData.entries())
  const gameId = body.continue ? body.continue : await startDraft(body)
  return redirect(`/${gameId}`)
}

export default function StartPage() {
  const [mode, setMode] = useState<'pending'|'nogameid'|'gameid'>('pending')
  const [gameId, setGameId] = useState<string | null>(null)
  
  useEffect(() => {
    const gameId = localStorage.getItem('gameid')
    if (gameId) {
      setMode('gameid')
      setGameId(gameId)
    } else {
      setMode('nogameid')
    }
  }, [])
  
  function handleStartNewDraft() {
    localStorage.removeItem('gameid')
    setMode('nogameid')
  }
  
  return (
    <>
      <h1>{pageHeading}</h1>
      <h2>For Twilight Imperium 4th edition. Rule One is an inside joke of my gaming group.</h2>
      {
        mode === 'pending' ? <h2>Loading...</h2> :
        mode === 'nogameid' ? <StartDraftForm /> :
          <ContinueDraftForm onStartNewDraft={handleStartNewDraft} gameid={gameId as string} />
    } </>
  )
}
