import React, { Component } from 'react'
import GameInfo from './GameInfo'
import Board from './Board'
import Player from './Player'
import Enemy from './Enemy'
import DebugState from './DebugState'
import { UP, DOWN, LEFT, RIGHT } from './constants'
import { pluck, getInputs } from './utils'
import neataptic from 'neataptic'
import max from 'lodash/max'
import chunk from 'lodash/chunk'
import uuid from 'uuid'

const AsyncComponent = React.unstable_AsyncComponent

const INITIAL_GAME_SPEED = 0.001
const PLAYER_AMOUNT = 100
const MUTATION_RATE = 0.05
const ELITISM_PERCENT = 0.05

const getDefaultState = ({ boardSize, playerSize, highScore = 0 }) => {
  const half = Math.floor(boardSize / 2) * playerSize
  return {
    gameId: uuid.v1(),
    size: {
      board: boardSize,
      player: playerSize,
      maxDim: boardSize * playerSize
    },
    positions: {
      player: {
        top: half,
        left: half
      },
      enemies: []
    },
    playerScore: 0,
    highScore,
    timeElapsed: 0,
    enemySpeed: 5,
    enemyIndex: 0,
    activeEnemies: 1,
    baseScore: 10
  }
}

export default class Game extends Component {
  constructor(props) {
    super(props)
    this.networkScores = []
    const { boardSize, playerSize } = props
    this.state = {
      ...getDefaultState({ boardSize, playerSize }),
      currentNetworkIndex: 0,
      gameSpeed: INITIAL_GAME_SPEED
    }
    this.neatNetwork = new neataptic.Neat(8, 4, this.getFitness, {
      popsize: PLAYER_AMOUNT,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT)
    })
    // localStorage.clear()
    if (localStorage.storedNeatNetwork) {
      try {
        const json = JSON.parse(localStorage.storedNeatNetwork)
        this.neatNetwork.import(json)
      } catch (error) {
        console.error(error)
      }
    }
    this.neatNetwork.generation++
    this.neatNetwork.sort()
  }

  getFitness = network => {
    return network.score
  }

  componentDidMount() {
    this.startGame()
  }

  componentWillUnmount() {
    this.clearIntervals()
  }

  clearIntervals = () => {
    clearInterval(this.gameInterval)
    clearInterval(this.enemyInterval)
    clearInterval(this.timeInterval)
    clearInterval(this.aiInterval)
  }

  placeEnemy = () => {
    // enemies always launch at player
    const { player: playerPos } = this.state.positions

    // assign to a random side
    const side = pluck([UP, DOWN, LEFT, RIGHT])

    // generate enemy object
    const newEnemy = this.generateNewEnemy(playerPos, side)

    // add new enemy to state
    this.setState({
      positions: {
        ...this.state.positions,
        enemies: [...this.state.positions.enemies].concat(newEnemy)
      }
    })
  }

  generateNewEnemy = (position, side) => {
    this.setState({
      enemyIndex: this.state.enemyIndex + 1
    })

    const newEnemy = { key: this.state.enemyIndex, dir: side }
    const { maxDim, player } = this.state.size

    switch (side) {
      case UP:
        newEnemy.top = maxDim
        newEnemy.left = position.left
        break
      case DOWN:
        newEnemy.top = 0 - player
        newEnemy.left = position.left
        break
      case LEFT:
        newEnemy.top = position.top
        newEnemy.left = maxDim
        break
      case RIGHT:
        newEnemy.top = position.top
        newEnemy.left = 0 - player
        break
    }

    return newEnemy
  }

  getCurrentNetwork = () => {
    return this.neatNetwork.population[this.state.currentNetworkIndex]
  }

  getNetworkInput = () => {
    const { positions: { enemies }, size: { player, maxDim } } = this.state
    const playerSize = this.state.size.player
    const playerPosition = this.state.positions.player
    const proximities = getInputs(
      enemies,
      playerPosition,
      maxDim,
      playerSize,
      this.props.boardSize
    )
    const input = [
      proximities.leftDanger,
      proximities.topDanger,
      proximities.rightDanger,
      proximities.bottomDanger,
      proximities.leftWallProximity,
      proximities.topWallProximity,
      proximities.rightWallProximity,
      proximities.bottomWallProximity
    ]

    return input
  }

  handleAIMovement = () => {
    const input = this.getNetworkInput()
    // if (input.filter(a => a).length === 0) {
    // return
    // }

    if (Math.random() < 0.0025) {
      requestAnimationFrame(() => {
        this.setState({
          debugInput: input,
          debugResult: result
        })
      })
    }
    const network = this.getCurrentNetwork()
    const result = network.activate(input)
    network.score = this.state.playerScore

    const maxResult = max(result)
    if (maxResult < 0.5) {
      return null
    }
    const index = result.findIndex(element => element === maxResult)
    const directionsByIndex = {
      0: 'LEFT',
      1: 'UP',
      2: 'RIGHT',
      3: 'DOWN'
    }
    this.handlePlayerMovement(
      {
        dir: directionsByIndex[index]
      },
      true
    )
  }

  handlePlayerMovement = (dirObj, isAI = false) => {
    const { top, left } = this.state.positions.player
    const { player, maxDim } = this.state.size
    let deltaLeft = 0
    let deltaTop = 0

    // check walls
    switch (dirObj.dir) {
      case UP:
        if (top === 0) return
        deltaTop = -1
        break
      case DOWN:
        if (top === maxDim - player) return
        deltaTop = 1
        break
      case LEFT:
        if (left === 0) return
        deltaLeft = -1
        break
      case RIGHT:
        if (left === maxDim - player) return
        deltaLeft = 1
        break
    }

    if (isAI === false) {
      const input = this.getNetworkInput()
      const output = [
        deltaLeft === -1 ? 1 : 0,
        deltaTop === -1 ? 1 : 0,
        deltaLeft === 1 ? 1 : 0,
        deltaTop === 1 ? 1 : 0
      ]
      const network = this.getCurrentNetwork()
      network.evolve([{ input, output }], {
        error: 0.2
      })
      setTimeout(() => {
        this.setState({
          debugInput: input,
          debugResult: output
        })
      }, 5)
    }
    // getNetworkInput
    // getCurrentNetwork

    const gameId = this.state.gameId
    this.setState({
      positions: {
        ...this.state.positions,
        player: {
          top: top + player * deltaTop,
          left: left + player * deltaLeft
        }
      }
    })
  }

  handlePlayerCollision = () => {
    this.resetGame()
  }

  startGame = () => {
    this.setIntervals()
  }

  setIntervals = () => {
    this.enemyInterval = setInterval(
      this.updateEnemyPositions,
      this.state.gameSpeed * 1
    )
    this.timeInterval = setInterval(this.updateGame, this.state.gameSpeed * 20)
    this.gameInterval = setInterval(
      this.updateEnemiesInPlay,
      this.state.gameSpeed * 5
    )
    this.aiInterval = setInterval(
      this.handleAIMovement,
      this.state.gameSpeed * 5
    )
  }

  updateGame = () => {
    const { timeElapsed } = this.state

    this.updateTimeAndScore()

    if (timeElapsed > 0) {
      // increment enemy speed
      if (timeElapsed % 3 === 0) {
        this.incrementEnemySpeed()
      }

      // increment max active enemies every 10 seconds
      if (timeElapsed % 10 === 0) {
        this.incrementActiveEnemies()
      }
    }
  }

  updateEnemyPositions = () => {
    const {
      enemySpeed,
      positions: { enemies },
      size: { player, maxDim }
    } = this.state
    const playerSize = this.state.size.player
    const playerPosition = this.state.positions.player

    this.setState({
      positions: {
        ...this.state.positions,
        enemies: enemies.filter(enemy => !enemy.remove).map(enemy => {
          if (
            enemy.top < 0 - player ||
            enemy.top > maxDim + player ||
            enemy.left < 0 - player ||
            enemy.left > maxDim + player
          ) {
            enemy.remove = true
            return enemy
          }

          // based on direction, increment the correct value (top / left)
          switch (enemy.dir) {
            case UP:
              enemy.top -= enemySpeed
              break
            case DOWN:
              enemy.top += enemySpeed
              break
            case LEFT:
              enemy.left -= enemySpeed
              break
            case RIGHT:
              enemy.left += enemySpeed
              break
          }

          return enemy
        })
      }
    })
  }

  updateEnemiesInPlay = () => {
    const { activeEnemies } = this.state
    const { enemies } = this.state.positions

    if (enemies.length < activeEnemies) {
      this.placeEnemy()
    }
  }

  updateTimeAndScore = () => {
    const { timeElapsed, playerScore, baseScore } = this.state

    this.setState({
      timeElapsed: timeElapsed + 1,
      playerScore: playerScore + baseScore
    })
  }

  incrementEnemySpeed = () => {
    const { enemySpeed } = this.state

    this.setState({
      enemySpeed: parseFloat((enemySpeed + 0.25).toFixed(2))
    })
  }

  incrementActiveEnemies = () => {
    this.setState({
      activeEnemies: this.state.activeEnemies + 1
    })
  }

  resetGame = async () => {
    const currentNetworkIndex = this.state.currentNetworkIndex
    const { boardSize, playerSize } = this.props
    const { playerScore, highScore, globalHighScore, debug } = this.state

    // clear intervals
    this.clearIntervals()

    if (currentNetworkIndex >= PLAYER_AMOUNT - 1) {
      if (this.neatNetwork.generation > 1) {
        const networkScores = this.neatNetwork.population
          .map((network, index) => network.score)
          .filter(a => a)
        networkScores.sort((a, b) => (a < b ? -1 : 1))
        networkScores.reverse()
        this.networkScores = networkScores
      }
      await this.neatNetwork.evolve()
      localStorage.storedNeatNetwork = JSON.stringify(this.neatNetwork.export())
    }

    // reset state
    this.setState({
      ...getDefaultState({ boardSize, playerSize, highScore }),
      // persist debug state and high scores
      debug,
      highScore: playerScore > highScore ? playerScore : highScore,
      globalHighScore,
      currentNetworkIndex:
        currentNetworkIndex >= PLAYER_AMOUNT - 1 ? 0 : currentNetworkIndex + 1
    })
    // restart game
    this.startGame()
  }

  handleDebugToggle = () => {
    this.setState({
      debug: this.debug.checked
    })
  }

  style = () => {
    return {
      width: '85%',
      maxWidth: '600px',
      margin: '0 auto'
    }
  }

  handleGameSpeedChange = event => {
    this.setState({ gameSpeed: event.target.value }, () => {
      this.clearIntervals()
      this.setIntervals()
    })
  }

  render() {
    const {
      size: { board, player },
      positions: { player: playerPos },
      playerScore,
      timeElapsed,
      highScore,
      globalHighScore
    } = this.state

    const sum = this.networkScores.reduce((state, score) => state + score, 0)
    const average = sum / (this.networkScores.length || 1)

    return (
      <div style={this.style()}>
        <AsyncComponent>
          <GameInfo
            playerScore={playerScore}
            timeElapsed={timeElapsed}
            highScore={highScore}
            globalHighScore={globalHighScore}
            currentNetworkIndex={this.state.currentNetworkIndex}
            generation={this.neatNetwork.generation}
          />

          <Board dimension={board * player}>
            <Player
              size={player}
              position={playerPos}
              handlePlayerMovement={this.handlePlayerMovement}
            />

            {this.state.positions.enemies.map(enemy => (
              <Enemy
                key={enemy.key}
                size={player}
                info={enemy}
                playerPosition={playerPos}
                onCollide={this.handlePlayerCollision}
              />
            ))}
          </Board>
          {true && (
            <p style={{ position: 'fixed', bottom: 0, left: 16 }}>
              Debug:{' '}
              <input
                type="checkbox"
                onChange={this.handleDebugToggle}
                ref={n => (this.debug = n)}
              />
            </p>
          )}
          {this.state.debug && <DebugState data={this.state} />}
          <div>
            Game speed:
            <input
              type="range"
              defaultValue={INITIAL_GAME_SPEED}
              min={INITIAL_GAME_SPEED}
              max={1000}
              step={0.001}
              onChange={this.handleGameSpeedChange}
            />
          </div>
          {average > 0 && (
            <div>
              <pre>Max: {Math.max(...this.networkScores)}</pre>
              <pre>
                Median:{' '}
                {this.networkScores[Math.floor(this.networkScores.length / 2)]}
              </pre>
              <pre>Mean: {Math.round(average)}</pre>
              <pre>Min: {Math.min(...this.networkScores)}</pre>
              <pre>
                Network scores:{' \n'}
                {chunk(this.networkScores, 10)
                  .map(row => row.join(', '))
                  .join('\n')}
              </pre>
              <pre>
                Sample input: {JSON.stringify(this.state.debugInput, null, 2)}
              </pre>
              <pre>
                Sample result: {JSON.stringify(this.state.debugResult, null, 2)}
              </pre>
            </div>
          )}
        </AsyncComponent>
      </div>
    )
  }
}
