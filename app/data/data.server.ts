import {config} from 'dotenv'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { WebSocketServer, WebSocket } from 'ws'
import {Player, Map, DraftItem} from '~/global'
import factions from './factions.json'
import * as process from 'node:process'
import express from 'express'
import * as http from 'node:http'

config()
mongoose.connect(process.env.DB_URL as string)

const gameSchema = new mongoose.Schema({
  gameId: { type: String, default: uuidv4 },
  players: Array,
  maps: [{ name: String, url: String, votes: Number, image: { type: Buffer, default: null } }],
  state: String,
  base: Boolean,
  pok: Boolean,
  keleres: Boolean,
  ds: Boolean,
  dsplus: Boolean,
  factionPoolSize: Number,
  initiativeSet: Boolean,
  bannedFactions: { type: [String], default: [] },
  draftDirection: { type: String, default: 'forward' },
  currentPlayer: { type: Number, default: 0 },
})

delete mongoose.models.Game // uncomment this line to reset the model
const Game = mongoose.models.Game || mongoose.model("Game", gameSchema)

const app = express()
const server = http.createServer(app)
const ws = new WebSocketServer({ server })
server.listen(process.env.PORT, () => {
  console.log('Server running on port', process.env.PORT)
})

function broadcast(gameId: string | undefined) {
  ws.clients.forEach((client: any)=> {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({type: 'update', gameId}))
    }
  })
}

export async function startDraft(data: Record<string, any>) {
  const players: Player[] = []
  const maps: Map[] = []

  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('player-')) {
      players.push({
        name: value.toString(), mapVote: -1, id: uuidv4(), factions_to_ban: [], number_of_bans: 0
      })
      if (players.length === 1) players[0].admin = true
    } else if (key.startsWith('map-name-')) {
      const index = +key.split('-')[2]
      maps[index] = maps[index] || { name: '', url: '', votes: 0, image: null }
      maps[index].name = value.toString()
    } else if (key.startsWith('map-url-')) {
      const index = +key.split('-')[2]
      maps[index] = maps[index] || { name: '', url: '', votes: 0, image: null }
      maps[index].url = value.toString()
    } else if (key.startsWith('map-image-')) {
      const index = +key.split('-')[2]
      maps[index] = maps[index] || {name: '', url: '', votes: 0, image: null}
      maps[index].image = Buffer.from(value as string, 'base64')
    }
  })
  
  const state = maps.length > 1 ? "voting" : (banningNeeded(data) ? "banning" : "drafting")
  
  if (state !== 'voting') players.sort(() => Math.random() - 0.5)
  
  const gameData = {
    players,
    maps,
    state,
    base: !!data.base,
    pok: !!data.pok,
    keleres: !!data.keleres,
    ds: !!data.ds,
    dsplus: !!data.dsplus,
    factionPoolSize: +data.factionPoolSize,
    initiativeSet: state !== 'voting',
  }
  
  const game = new Game(state === 'banning' ? _distributeFactionsToBan(gameData) : gameData)
  await game.save()
  return game.gameId
}

function banningNeeded(data: any) {
  let includedFactions = 0
  if (data.base) includedFactions += factions[0].factions.length
  if (data.pok) includedFactions += factions[1].factions.length
  if (data.keleres) includedFactions += factions[2].factions.length
  if (data.ds) includedFactions += factions[3].factions.length
  if (data.dsplus) includedFactions += factions[4].factions.length
  return includedFactions > +data.factionPoolSize
}

export async function loadDraft(gameId: string | undefined) {
  const game = await Game.findOne({ gameId })
  if (!game) return null
  return {
    players: game.players,
    maps: game.maps,
    state: game.state,
    base: game.base,
    pok: game.pok,
    keleres: game.keleres,
    ds: game.ds,
    dsplus: game.dsplus,
    factionPoolSize: game.factionPoolSize,
    bannedFactions: game.bannedFactions,
    gameId,
    currentPlayer: game.currentPlayer,
  }
}

export async function removeDraft(gameId: string | undefined) {
  const game = await Game.findOne({gameId})
  if (!game) return
  await Game.deleteOne({gameId})
}

export async function updateMapImage(gameId: string | undefined, index: number, image: ArrayBuffer) {
  const game = await Game.findOne({ gameId })
  if (!game) return
  if (index < 0 || index >= game.maps.length) return
  game.maps[index].image = image
  await game.save()
  broadcast(gameId)
}

export async function vote(gameId: string | undefined, player: Player, mapIndex: number, breakTie = false) {
  const game = await Game.findOne({gameId})
  if (!game) return
  if (game.state !== 'voting') return
  
  const map = game.maps[mapIndex]
  if (!map) return
  map.votes++
  
  if (player.mapVote >= 0 && !breakTie) {
    const previousMap = game.maps[player.mapVote]
    if (previousMap) previousMap.votes--
  }
  player.mapVote = mapIndex
  game.players[game.players.findIndex((p: Player) => p.id === player.id)] = player
  
  await game.save()
  if (!breakTie) broadcast(gameId)
}

export async function submitVoting(gameId: string | undefined) {
  const game = await Game.findOne({gameId})
  if (!game) return
  if (game.state !== 'voting') return
  game.state = banningNeeded(game) ? "banning" : "drafting"
  game.players.sort(() => Math.random() - 0.5)
  const newGame = game.state === 'banning' ? _distributeFactionsToBan(game) : game
  await newGame.save()
  broadcast(gameId)
}

function getFactionPool(game: any) {
  const factionPool = []
  if (game.base) factionPool.push(...factions[0].factions)
  if (game.pok) factionPool.push(...factions[1].factions)
  if (game.keleres) factionPool.push(...factions[2].factions)
  if (game.ds) factionPool.push(...factions[3].factions)
  if (game.dsplus) factionPool.push(...factions[4].factions)
  return factionPool
}

function _distributeFactionsToBan(game: any) {
  const initFactionPool = getFactionPool(game)
  initFactionPool.sort(() => Math.random() - 0.5)
  
  const players = game.players
  const factionDivision = Math.floor(initFactionPool.length / players.length) //4
  const factionRemainder = initFactionPool.length % players.length //1
  const factionPoolDivision = Math.floor(game.factionPoolSize / players.length) //1
  const factionPoolRemainder = game.factionPoolSize % players.length //3
  
  const calcNumberOfBans = (i: number, totalFactions: number) => {
    return totalFactions - (factionPoolDivision + (i < factionPoolRemainder ? 1 : 0))
  }
  
  let i
  for (i = 0; i < factionRemainder; i++) {
    players[i].factions_to_ban = initFactionPool.slice(
      i * (factionDivision + 1), (i + 1) * (factionDivision + 1)
    )
    players[i].number_of_bans = calcNumberOfBans(i, players[i].factions_to_ban.length)
  }
  for (; i < players.length; i++) {
    players[i].factions_to_ban = initFactionPool.slice(
      i * factionDivision + factionRemainder, (i + 1) * factionDivision + factionRemainder
    )
    players[i].number_of_bans = calcNumberOfBans(i, players[i].factions_to_ban.length)
  }
  
  return game
}

export async function submitBans(gameId: string | undefined, player: string, bans: string[]) {
  const game = await Game.findOne({gameId})
  if (!game) return
  if (game.state !== 'banning') return
  
  const playerIndex = game.players.findIndex((p: Player) => p.id === player)
  game.players[playerIndex].factions_to_ban = []
  game.markModified(`players.${playerIndex}.factions_to_ban`)
  if (!game.players.find((p: Player) => p.factions_to_ban.length > 0)) {
    game.state = 'drafting'
  }
  game.bannedFactions = [...game.bannedFactions, ...bans]
  await game.save()
  broadcast(gameId)
}

export async function draftItem(gameId: string | undefined, player: string, item: DraftItem) {
  const game = await Game.findOne({gameId})
  if (!game) return
  if (game.state !== 'drafting') return
  
  const playerIndex = game.players.findIndex((p: Player) => p.id === player)
  switch (item.type) {
    case 'faction':
      game.players[playerIndex].faction = item.value
      break
    case 'slice':
      game.players[playerIndex].slice = +item.value
      break
    case 'speaker':
      game.players[playerIndex].speaker = true
      break
  }
  
  let nextPlayerAttempts = 0
  const maxNextPlayerAttempts = game.players.length
  do {
    if (game.draftDirection === 'forward') {
      if (game.currentPlayer + 1 < game.players.length) {
        game.currentPlayer++
        game.players[game.currentPlayer] = populateLeftOverChoices(game.players[game.currentPlayer], game)
        nextPlayerAttempts++
      } else {
        game.draftDirection = 'backward'
      }
    } else {
      if (game.currentPlayer > 0) {
        game.currentPlayer--
        game.players[game.currentPlayer] = populateLeftOverChoices(game.players[game.currentPlayer], game)
        nextPlayerAttempts++
      } else {
        game.draftDirection = 'forward'
      }
    }
    if (nextPlayerAttempts >= maxNextPlayerAttempts) {
      game.state = 'finished'
      break
    }
  } while (playerFinishedDrafting(game.players[game.currentPlayer], speakerChosen(game)))
  
  game.markModified("players")
  await game.save()
  broadcast(gameId)
}

function speakerChosen(game: any) {
  return game.players.some((player: Player) => player.speaker)
}

function playerFinishedDrafting(player: Player, speakerChosen: boolean | undefined) {
  return player.faction && player.slice !== undefined && speakerChosen
}

function populateLeftOverChoices(player: Player, game: any) {
  if (player.faction && player.slice !== undefined && !speakerChosen(game)) {
    player.speaker = true
  }
  if (!player.slice) {
    const takenSlices = game.players.map((p: Player) => p.slice).filter((s: number | undefined) => s !== undefined)
    const allSlices = Array.from({ length: game.players.length }, (_, i) => i + 1)
    const availableSlices = allSlices.filter(s => !takenSlices.includes(s))
    if (availableSlices.length === 1) {
      player.slice = availableSlices[0]
    }
  }
  if (!player.faction) {
    const takenFactions = game.players.map((p: Player) => p.faction).filter((f: string | undefined) => f !== undefined)
    const factionPool = getFactionPool(game).filter((faction: {id: string}) => !game.bannedFactions.includes(faction.id))
    const availableFactions = factionPool.filter((f: {id: string}) => !takenFactions.includes(f.id))
    if (availableFactions.length === 1) {
      player.faction = availableFactions[0].id
    }
  }
  return player
}
