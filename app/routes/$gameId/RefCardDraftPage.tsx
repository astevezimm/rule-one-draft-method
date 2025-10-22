import {DraftPageContentProps} from '~/routes/$gameId/route'

export default function RefCardDraftPage({playerSelected, selectedPlayer, state}: DraftPageContentProps) {
  return (
    <>
      <h2>Select main game faction to draft. Rest will be passed.</h2>
      <h3>One choice for seating initiative (lowest is speaker), one for home system, and one for starting units.</h3>
      <div className="ref-card-draft card main-section">
        <h2>Options</h2>
      </div>
      <div className="ref-card-draft card main-section">
        <h2>Your Drafted Cards</h2>
      </div>
    </>
  )
}