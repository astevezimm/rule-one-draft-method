import {Player, Map, PlayerSelected} from '~/global'
import {useLoaderData} from '@remix-run/react'
import factions from '~/data/factions.json'
import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useState} from 'react'

export default function SnakeDraftPage({playerSelected, selectedPlayer}: DraftPageContentProps) {
  const {map, factionPool, currentPlayer, speaker, gameId} = useDraftData()
  const [expandedFaction, setExpandedFaction] = useState<{id: string, name: string, wiki: string} | null>(null)
  
  const isActivePlayer = ['admin', 'yes'].includes(playerSelected) && selectedPlayer === currentPlayer.id
  
  function handleSelection(type: string, value: string | number | null = null) {
    if (!isActivePlayer) return
    fetch("/api/draft-item", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        player: currentPlayer.id,
        type,
        value
      })
    }).then(response => {
      if (response.ok) {
        window.location.reload()
      }
    })
  }
  
  const choicesText = []
  if (!currentPlayer.faction) choicesText.push('faction')
  if (!currentPlayer.slice) choicesText.push('slice')
  if (!currentPlayer.speaker) choicesText.push('speaker')
  choicesText[choicesText.length - 1] = `or ${choicesText[choicesText.length - 1]}!`
  
  return (
    <div className="draft-page">
      <h2><span>{currentPlayer?.name}:</span> Choose {choicesText.join(', ')}</h2>
      <div className="card speaker">
        <h3>Speaker</h3>
        {speaker ? (
          <p>{speaker.name}</p>
        ) : (
          <button disabled={!isActivePlayer} onClick={() => handleSelection('speaker')}>
            <img src={`images/gavel.jpg`} alt="gavel" />
          </button>
        )}
      </div>
      {map && (
        <div className="card slices">
          <h3>Slices</h3>
          <a href={map.url} target="_blank" rel="noopener noreferrer">
            {map.image && ((map.image as unknown) as {data: {length: number}}).data.length > 0 ?
              <img src={`data:image/jpeg;base64,${Buffer.from(map.image).toString('base64')}`} alt={map.name} /> :
              <div className="map-image-placeholder" />
            }
          </a>
        </div>
      )}
      <div className="card factions">
        <h3>Factions</h3>
        <ul className="draft-page-factions">
          {factionPool.map(faction => (
            <li key={faction.id}>
              <button onClick={() => setExpandedFaction(faction)}>
                <img src={`images/${faction.id}.jpg`} alt={faction.name} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {expandedFaction && (
        <div className="expanded-faction-view">
          <button className="close" onClick={() => setExpandedFaction(null)}>X</button>
          <a href={expandedFaction.wiki} target="_blank" rel="noopener noreferrer">
            <img src={`images/${expandedFaction.id}.jpg`} alt={expandedFaction.name} />
          </a>
          <button
            onClick={() => handleSelection('faction', expandedFaction.id)}
            disabled={!isActivePlayer}
          >
            Select
          </button>
        </div>
      )}
    </div>
  )
}

function useDraftData() {
  type DraftData = {
    maps: Map[]
    base: boolean
    pok: boolean
    keleres: boolean
    ds: boolean
    dsplus: boolean
    bannedFactions: string[]
    currentPlayer: number
    players: Player[]
    gameId: string
  }
  
  const {
    maps, base, pok, keleres, ds, dsplus, bannedFactions, currentPlayer, players, gameId
  } = useLoaderData() as DraftData
  
  const map = maps.length === 1 ? maps[0] :
    maps.find(map => map.votes = Math.max(...maps.map(m => m.votes)))
  
  const factionPool = []
  if (base) factionPool.push(...factions[0].factions)
  if (pok) factionPool.push(...factions[1].factions)
  if (keleres) factionPool.push(...factions[2].factions)
  if (ds) factionPool.push(...factions[3].factions)
  if (dsplus) factionPool.push(...factions[4].factions)
  const filteredFactionPool = factionPool.filter(
    faction => !bannedFactions.includes(faction.id)
  )
  
  const speaker = players.find(player => player.speaker)
  
  return {map, factionPool: filteredFactionPool, currentPlayer: players[currentPlayer], speaker, gameId}
}
