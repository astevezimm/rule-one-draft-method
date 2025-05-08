import {useLoaderData} from '@remix-run/react'
import {extractMapImage, Map, Player, PlayerSelected} from '~/global'
import {Buffer} from 'buffer'
import UploadScreenshot from '~/components/UploadScreenshot'
import {ChangeEvent, MouseEvent} from 'react'
import {DraftPageContentProps} from '~/routes/$gameId/route'

export default function VotingPage({playerSelected, selectedPlayer}: DraftPageContentProps) {
  const {maps, players, gameId} = useLoaderData() as {maps: Map[], players: Player[], gameId: string}
  
  async function handleChangeMapImage(event: ChangeEvent<HTMLInputElement>) {
    const image = await extractMapImage(event.target.files?.[0]) as ArrayBuffer | null
    const data = {
      gameId,
      index: event.target.dataset.index,
      image: image ? Buffer.from(image).toString('base64') : null
    }
    await fetch('/api/update-map-image', { method: 'PUT', body: JSON.stringify(data) })
    window.location.reload()
  }
  
  function handleVote(event: MouseEvent<HTMLButtonElement>) {
    const mapIndex = Number((event.target as HTMLButtonElement).dataset.index)
    const data = {
      gameId,
      player: players[players.findIndex(player => player.id === selectedPlayer)],
      mapIndex
    }
    fetch('/api/vote', { method: 'POST', body: JSON.stringify(data) })
      .then(() => window.location.reload())
      .catch((error) => console.error('Error:', error))
  }
  
  return (
    <div className="map-vote main-section card">
      <h2>Vote for a Map</h2>
      <ul>
        {maps.map((map, index) => (
          <li key={`map-${index}`}>
            <h3>{map.name}</h3>
            <h4>Votes: {map.votes}</h4>
            <a href={map.url} target="_blank" rel="noopener noreferrer">
              {map.image && ((map.image as unknown) as {data: {length: number}}).data.length > 0 ?
                <img src={`data:image/jpeg;base64,${Buffer.from(map.image).toString('base64')}`} alt={map.name} /> :
                <div className="map-image-placeholder" />
              }
            </a>
            {playerSelected === 'admin' && (
              <UploadScreenshot
                index={index}
                image={map.image}
                onChangeImage={handleChangeMapImage}
              />
            )}
            <button onClick={handleVote} data-index={index}>Vote</button>
          </li>
        ))}
      </ul>
      {/* Display current player's vote */}
    </div>
  )
}
