import {post} from '~/global'
import {DraftPageContentProps} from './route'
import {useState} from 'react'
import SeatDraft, {useDraftData} from './SeatDraft'

export default function SnakeDraftPage({playerSelected, selectedPlayer, state}: DraftPageContentProps & {state: string}) {
  const {factionPool, currentPlayer, speaker, gameId, players} = useDraftData()
  const [expandedFaction, setExpandedFaction] = useState<{id: string, name: string, wiki: string} | null>(null)
  
  const isActivePlayer = ['admin', 'yes'].includes(playerSelected) && selectedPlayer === currentPlayer.id
  
  function handleSelection(value: string | number | null = null, type?: string) {
    if (!isActivePlayer) return
    post(`/api/draft-item`, {
      gameId,
      player: currentPlayer.id,
      type,
      value
    })
  }
  
  let h2Text = null
  if (state === 'drafting') {
    const choicesText = []
    if (!currentPlayer.faction) choicesText.push('faction')
    if (!currentPlayer.slice) choicesText.push('slice')
    if (!speaker) choicesText.push('speaker')
    if (choicesText.length > 1) {
      choicesText[choicesText.length - 1] = `or ${choicesText[choicesText.length - 1]}`
    }
    h2Text = <><span>{currentPlayer?.name}:</span> Choose {choicesText.join(', ') + '!'}</>
  }
  else {
    h2Text = "The Draft is now DONE! Stick a fork in it!"
  }
  
  return (
    <div className="draft-page">
      <h2>{h2Text}</h2>
      <div className="card speaker">
        <h3>Speaker</h3>
        {speaker ? (
          <p>{speaker.name}</p>
        ) : (
          <button disabled={!isActivePlayer} onClick={() => handleSelection(null,'speaker')}>
            <img src={`images/gavel.jpg`} alt="gavel" />
          </button>
        )}
      </div>
      <SeatDraft onSelection={handleSelection} isActivePlayer={isActivePlayer} />
      <div className="card factions">
        <h3>Factions</h3>
        <ul className="draft-page-factions">
          {factionPool.map(faction => {
            const dataLabel = players.find(player => player.faction === faction.id)?.name || ''
            return (
              <li key={faction.id}>
                <button onClick={() => setExpandedFaction(faction)} data-label={dataLabel}>
                  <img src={`images/${faction.id}.jpg`} alt={faction.name}/>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      {expandedFaction && (
        <div className="expanded-faction-view">
          <button className="close" onClick={() => setExpandedFaction(null)}>X</button>
          <a href={expandedFaction.wiki} target="_blank" rel="noopener noreferrer">
            <img src={`images/${expandedFaction.id}.jpg`} alt={expandedFaction.name} />
          </a>
          <button
            onClick={() => handleSelection(expandedFaction.id, 'faction')}
            disabled={
              !isActivePlayer || !!currentPlayer.faction || !!players.find(player => player.faction === expandedFaction.id)
            }
          >
            Select
          </button>
        </div>
      )}
    </div>
  )
}
