import {Player, Map} from '~/global'
import {useLoaderData} from '@remix-run/react'
import factions from '~/data/factions.json'
import {DraftPageContentProps} from '~/routes/$gameId/route'
import {useState, MouseEvent} from 'react'
import {Buffer} from 'buffer'

export default function SnakeDraftPage({playerSelected, selectedPlayer, state}: DraftPageContentProps & {state: string}) {
  const {map, factionPool, currentPlayer, speaker, gameId, playerCount, players} = useDraftData()
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
  
  function getSeatPlayer(seatNumber: number): Player | null {
    const seatPlayer = players.find(player => player.slice === seatNumber)
    return seatPlayer || null
  }
  
  function generateSeats(className: string) {
    const active = isActivePlayer && !currentPlayer.slice
    
    let seats: number[] = []
    switch (playerCount) {
      case 3: seats = [2, 4, 6]
        break
      case 5: seats = [1, 2, 3, 5, 6]
        break
      case 6: seats = [1, 2, 3, 4, 5, 6]
        break
      case 7: seats = [1, 2, 3, 4, 6, 7, 8]
        break
      case 8: seats = [1, 2, 3, 4, 5, 6, 7, 8]
        break
      case 4: return (
        <>
          <SeatButton
            className={className}
            fourPlayer seatPosition={1} seatNumber={1} active={active}
            onSelect={() => handleSelection('slice', 1)}
            player={getSeatPlayer(1)}
          />
          <SeatButton
            className={className}
            fourPlayer seatPosition={2} seatNumber={2} active={active}
            onSelect={() => handleSelection('slice', 2)}
            player={getSeatPlayer(2)}
          />
          <SeatButton
            className={className}
            fourPlayer seatPosition={3} seatNumber={3} active={active}
            onSelect={() => handleSelection('slice', 3)}
            player={getSeatPlayer(3)}
          />
          <SeatButton
            className={className}
            fourPlayer seatPosition={4} seatNumber={4} active={active}
            onSelect={() => handleSelection('slice', 4)}
            player={getSeatPlayer(4)}
          />
        </>
      )
    }
    
    return seats.map((seat, index) => {
      return (
        <SeatButton
          className={className}
          seatPosition={seat} seatNumber={index + 1} active={active}
          onSelect={() => handleSelection('slice', index + 1)}
          key={`seat-${seat}-${index}`}
          player={getSeatPlayer(index + 1)}
        />
      )
    })
  }
  
  let h2Text = null
  if (state === 'drafting') {
    const choicesText = []
    if (!currentPlayer.faction) choicesText.push('faction')
    if (!currentPlayer.slice) choicesText.push('slice')
    if (!speaker) choicesText.push('speaker')
    choicesText[choicesText.length - 1] = `or ${choicesText[choicesText.length - 1]}!`
    h2Text = <><span>{currentPlayer?.name}:</span> Choose {choicesText.join(', ')}</>
  }
  else {
    h2Text = "The Draft is now DONE! Stick a fork in it!"
  }
  
  const hasMapImage = map && map.image && ((map.image as unknown) as {data: {length: number}}).data.length > 0
  
  return (
    <div className="draft-page">
      <h2>{h2Text}</h2>
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
        <div className={`card slices ${playerCount >= 7 ? 'large' : ''}`}>
          <h3>
            Slices
            <span>
              <a href={map.url} target="_blank" rel="noopener noreferrer">
                Link to Map
              </a>
            </span>
          </h3>
          <div className={`${hasMapImage ? 'has-image' : ''}`}>
            {hasMapImage && map.image ?
              <img src={`data:image/jpeg;base64,${Buffer.from(map.image).toString('base64')}`} alt={map.name} /> :
              <div className="map-image-placeholder" />
            }
          </div>
          {generateSeats(`${hasMapImage ? 'has-image' : ''}`)}
        </div>
      )}
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
            onClick={() => handleSelection('faction', expandedFaction.id)}
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
  
  return {
    map, factionPool: filteredFactionPool,
    currentPlayer: players[currentPlayer], playerCount: players.length,
    speaker, gameId, players
  }
}

type SeatButtonProps = {
  className: string
  fourPlayer?: boolean
  seatPosition: number
  seatNumber: number
  active: boolean
  onSelect: () => void
  player: Player | null
}

function SeatButton({
  className: propClassName, fourPlayer = false, seatPosition, seatNumber, active, onSelect, player
}: SeatButtonProps)
{
  const occupiedClasses = player ? `occupied ${nameLengthClass(player.name)}` : ''
  const className = `seat-hex ${fourPlayer ? 'p4-' : ''}seat-${seatPosition} ${occupiedClasses} ${propClassName}`
  
  return (
    <button disabled={!active || !!player} className={className} onClick={onSelect}>
      {player ? player.name : `P${seatNumber}`}
    </button>
  )
}

function nameLengthClass(name: string): string {
  if (name.length < 5) return ''
  return name.length < 7 ? 'md-name' : 'lg-name'
}
