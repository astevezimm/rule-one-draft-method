import {DraftPageContentProps} from '~/routes/$gameId/route'
import SeatDraft, {useDraftData} from '~/routes/$gameId/SeatDraft'
import {post} from '~/global'

export default function DraftSlicePage({selectedPlayer}: DraftPageContentProps) {
  const {currentPlayer, gameId} = useDraftData()
  const isActivePlayer = selectedPlayer === currentPlayer.id

  function handleSelection(value: string | number | null) {
    if (!isActivePlayer) return
    post(`/api/draft-tfslice`, {
      gameId,
      player: currentPlayer.id,
      value
    })
  }
  
  return (
    <>
      <h2><span>{currentPlayer?.name}:</span> Choose your slice!</h2>
      <SeatDraft onSelection={handleSelection} isActivePlayer={isActivePlayer} />
    </>
  )
}
