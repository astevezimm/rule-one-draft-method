import {useState} from 'react'

const NUMBER_OF_STARS = 100

function generateStars() {
  const stars: [number, number][] = []
  for (let i = 0; i < NUMBER_OF_STARS; i++) {
    stars.push([Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)])
  }
  return stars
}

export default function Stars() {
  const [stars, setStars] = useState<[number, number][]>(generateStars)
  
  return (
    <ul className="stars">
      {stars.map((star, index) => (
        <li key={`star-${index}`} style={{left: `${star[0]}%`, top: `${star[1]}%`}} className="star" />
      ))}
    </ul>
  )
}