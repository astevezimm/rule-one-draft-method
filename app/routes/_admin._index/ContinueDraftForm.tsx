import {Form} from '@remix-run/react'

export default function ContinueDraftForm({onStartNewDraft, gameid}: {onStartNewDraft: () => void, gameid: string}) {
  return (
    <Form method="post">
      <h2>You have an existing draft. Continue this one or Start a new draft?</h2>
      <div className="cont-draft-btns">
        <button type="submit" name="continue" value={gameid}>Continue</button>
        <button type="button" onClick={onStartNewDraft}>Start New Draft</button>
      </div>
    </Form>
  )
}
