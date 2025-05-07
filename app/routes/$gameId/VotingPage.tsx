import {useLoaderData} from '@remix-run/react'
import {Map, Player, PlayerSelected} from '~/global'
import {Buffer} from 'buffer'
import UploadScreenshot from '~/components/UploadScreenshot'
import {ChangeEvent} from 'react'

export default function VotingPage({playerSelected}: {playerSelected: PlayerSelected}) {
  const {maps, players, gameId} = useLoaderData() as {maps: Map[], players: Player, gameId: string}
  console.log(playerSelected)
  
  async function handleChangeMapImage(event: ChangeEvent<HTMLInputElement>) {
    const data = {
      gameId,
      index: event.target.dataset.index,
      
    }
    await fetch('/api/update-map-image', { method: 'PUT', body: JSON.stringify(data) })
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
            <button>Vote</button>
          </li>
        ))}
      </ul>
    </div>
  )
}