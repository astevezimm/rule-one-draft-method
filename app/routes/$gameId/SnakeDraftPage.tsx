import {Player, Map, PlayerSelected} from '~/global'
import {useLoaderData} from '@remix-run/react'
import factions from '~/data/factions.json'
import Players from '~/routes/$gameId/Players'

export default function SnakeDraftPage({playerSelected}: {playerSelected: PlayerSelected}) {
  // view of draft order with current player selected
  // nothing for user to do if not their turn
  // otherwise choice of speaker, slice, or race
  
  const {map, factionPool, currentPlayer} = useDraftData()
  const choices = []
  if (!currentPlayer.faction) choices.push('faction')
  if (!currentPlayer.slice) choices.push('slice')
  if (!currentPlayer.speaker) choices.push('speaker')
  choices[choices.length - 1] = `or ${choices[choices.length - 1]}!`
  
  return (
    <div className="draft-page">
      <h2><span>{currentPlayer?.name}:</span> Choose {choices.join(', ')}</h2>
      {map && (
        <div className="card">
          <h3>{map.name}</h3>
          <a href={map.url} target="_blank" rel="noopener noreferrer">
            {map.image && ((map.image as unknown) as {data: {length: number}}).data.length > 0 ?
              <img src={`data:image/jpeg;base64,${Buffer.from(map.image).toString('base64')}`} alt={map.name} /> :
              <div className="map-image-placeholder" />
            }
          </a>
        </div>
      )}
      <div className="card">
        <h3>Faction Pool</h3>
        <ul className="draft-page-factions">
          {factionPool.map(faction => (
            <li key={faction.id}>
              <a href={faction.wiki} target="_blank" rel="noopener noreferrer">
                <img src={`images/${faction.id}.jpg`} alt={faction.name} />
              </a>
            </li>
          ))}
        </ul>
      </div>
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
  }
  
  const {maps, base, pok, keleres, ds, dsplus, bannedFactions, currentPlayer, players} = useLoaderData() as DraftData
  
  const map = maps.find(map => map.votes = Math.max(...maps.map(m => m.votes)))
  
  const factionPool = []
  if (base) factionPool.push(...factions[0].factions)
  if (pok) factionPool.push(...factions[1].factions)
  if (keleres) factionPool.push(...factions[2].factions)
  if (ds) factionPool.push(...factions[3].factions)
  if (dsplus) factionPool.push(...factions[4].factions)
  const filteredFactionPool = factionPool.filter(
    faction => !bannedFactions.includes(faction.id)
  )
  
  return {map, factionPool: filteredFactionPool, currentPlayer: players[currentPlayer]}
}
