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
  const gameId = await startDraft(body)
  return redirect(`/${gameId}`)
}

export default function StartPage() {
  const [mode, setMode] = useState<'pending'|'nogameid'|'gameid'>('pending')
  
  useEffect(() => {
    const gameId = localStorage.getItem('gameid')
    if (gameId) {
      setMode('gameid')
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
      {
        mode === 'pending' ? <h2>Loading...</h2> :
        mode === 'nogameid' ? <StartDraftForm /> :
          <ContinueDraftForm onStartNewDraft={handleStartNewDraft} />
    } </>
  )
}
