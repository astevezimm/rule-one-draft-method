import {Map, Player} from '~/global'
import {useLoaderData} from '@remix-run/react'
import factions from '~/data/factions.json'
import mahactKings from '~/data/mahactKings.json'
import {Buffer} from 'buffer'

type SeatDraftProps = {
  onSelection: (value: string | number | null, type?: string) => void
  isActivePlayer: boolean
  twilightsFall?: boolean
}

export default function SeatDraft({onSelection, isActivePlayer, twilightsFall=false} : SeatDraftProps) {
  const {map, currentPlayer, playerCount, players} = useDraftData(twilightsFall)
  
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
            onSelect={() => onSelection(1, 'slice')}
            player={getSeatPlayer(1)}
          />
          <SeatButton
            className={className}
            fourPlayer seatPosition={2} seatNumber={2} active={active}
            onSelect={() => onSelection(2, 'slice')}
            player={getSeatPlayer(2)}
          />
          <SeatButton
            className={className}
            fourPlayer seatPosition={3} seatNumber={3} active={active}
            onSelect={() => onSelection(3, 'slice')}
            player={getSeatPlayer(3)}
          />
          <SeatButton
            className={className}
            fourPlayer seatPosition={4} seatNumber={4} active={active}
            onSelect={() => onSelection(4, 'slice')}
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
          onSelect={() => onSelection(index + 1, 'slice')}
          key={`seat-${seat}-${index}`}
          player={getSeatPlayer(index + 1)}
        />
      )
    })
  }

  const hasMapImage = map && map.image && ((map.image as unknown) as {data: {length: number}}).data.length > 0

  return (
    <>
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
    </>
  )
}

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

export function useDraftData(twilightsFall = false) {
  const {
    maps, currentPlayer, players, gameId
  } = useLoaderData() as DraftData

  const map = maps.length === 1 ? maps[0] :
    maps.find(map => map.votes = Math.max(...maps.map(m => m.votes)))

  const factionPool = twilightsFall ? mahactKings : regularGameFactionPool()

  const speaker = players.find(player => player.speaker)

  return {
    map, factionPool,
    currentPlayer: players[currentPlayer], playerCount: players.length,
    speaker, gameId, players
  }
}

function regularGameFactionPool() {
  const {
    base, pok, keleres, ds, dsplus, bannedFactions
  } = useLoaderData() as DraftData
  
  const factionPool = []
  if (base) factionPool.push(...factions[0].factions)
  if (pok) factionPool.push(...factions[1].factions)
  if (keleres) factionPool.push(...factions[2].factions)
  if (ds) factionPool.push(...factions[3].factions)
  if (dsplus) factionPool.push(...factions[4].factions)
  
  return factionPool.filter(
    faction => !bannedFactions.includes(faction.id)
  )
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
