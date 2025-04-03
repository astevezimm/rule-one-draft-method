import {useLoaderData} from '@remix-run/react'
import {Map, Player, PlayerSelected} from '~/global'

export default function VotingPage({playerSelected}: {playerSelected: PlayerSelected}) {
  // button to vote, if voted, button to change vote
  // admin of draft determines when to move on
  
  const {maps, players} = useLoaderData() as {maps: Map[], players: Player}
  
  return "voting page"
}