import {Form} from '@remix-run/react'

export default function ContinueDraftForm({onStartNewDraft, gameId}: {onStartNewDraft: () => void, gameId: string}) {
  return (
    <Form method="post" className="card">
      <h2>You have an existing draft. Continue this one or Start a new draft?</h2>
      <div className="cont-draft-btns">
        <button type="submit" name="continue" value={gameId}>Continue</button>
        <button type="button" onClick={onStartNewDraft}>Start New Draft</button>
      </div>
    </Form>
  )
}
