import {useLoaderData} from '@remix-run/react'
import {Map, Player, PlayerSelected} from '~/global'
import {Buffer} from 'buffer'
import UploadScreenshot from '~/components/UploadScreenshot'
import {ChangeEvent} from 'react'

export default function VotingPage({playerSelected}: {playerSelected: PlayerSelected}) {
  // button to vote, if voted, button to change vote
  // admin of draft determines when to move on
  
  const {maps, players} = useLoaderData() as {maps: Map[], players: Player}
  console.log(playerSelected)
  
  function handleChangeMapImage(event: ChangeEvent<HTMLInputElement>) {
    
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