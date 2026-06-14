import {Map} from '~/global'
import {Buffer} from 'buffer'

export default function ReferenceMap({map} : {map: Map}) {
  return (
    <div className="reference-map">
      <a href={map.url} target="_blank" rel="noopener noreferrer"><h3>Map to reference</h3></a>
      {map.image && (
        <div className="reference-image">
          {((map.image as unknown) as {data: {length: number}}).data.length > 0 &&
            <img src={`data:image/jpeg;base64,${Buffer.from(map.image).toString('base64')}`} alt={map.name} />
          }
        </div>
      )}
    </div>
  )
}