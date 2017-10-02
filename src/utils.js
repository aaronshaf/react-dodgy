import React from 'react'

export const puke = obj => <pre>{JSON.stringify(obj, null, 2)}</pre>
export const pluck = arr => arr[Math.floor(Math.random() * arr.length)]

export function getInputs(
  enemies,
  playerPosition,
  maxDim,
  playerSize,
  boardSize
) {
  const leftDanger =
    playerPosition.left <= 0
      ? 0.8
      : playerPosition.left <= 1 * playerSize ? 0.4 : 0
  const topDanger =
    playerPosition.top <= 0
      ? 0.8
      : playerPosition.top <= 1 * playerSize ? 0.4 : 0
  const rightDanger =
    playerPosition.left + playerSize >= boardSize * playerSize
      ? 0.8
      : playerPosition.left + playerSize >= (boardSize - 1) * playerSize
        ? 0.4
        : 0
  const bottomDanger =
    playerPosition.top + playerSize >= boardSize * playerSize
      ? 0.8
      : playerPosition.top + playerSize >= (boardSize - 1) * playerSize
        ? 0.4
        : 0

  return enemies.filter(enemy => enemy.remove !== true).reduce((
    state,
    enemy
  ) => {
    let { leftDanger, topDanger, rightDanger, bottomDanger } = state
    if (enemy.top === playerPosition.top) {
      if (enemy.left < playerPosition.left) {
        const directLeftDanger =
          (maxDim - (playerPosition.left - enemy.left)) / maxDim
        leftDanger = Math.max(state.leftDanger, directLeftDanger)
      } else {
        rightDanger = Math.max(
          state.rightDanger,
          (maxDim - (enemy.left - playerPosition.left + playerSize)) / maxDim
        )
      }
    } else if (enemy.left === playerPosition.left) {
      if (enemy.top < playerPosition.top) {
        topDanger = Math.max(
          state.topDanger,
          (maxDim - (playerPosition.top - enemy.top)) / maxDim
        )
      } else {
        bottomDanger = Math.max(
          state.bottomDanger,
          (maxDim - (enemy.top - playerPosition.top + playerSize)) / maxDim
        )
      }
    }
    return {
      ...state,
      leftDanger,
      topDanger,
      rightDanger,
      bottomDanger
    }
  }, {
    leftDanger,
    topDanger,
    rightDanger,
    bottomDanger,
    leftWallProximity: (maxDim - playerPosition.left) / maxDim,
    topWallProximity: (maxDim - playerPosition.top) / maxDim,
    rightWallProximity: (playerPosition.left + playerSize) / maxDim,
    bottomWallProximity: (playerPosition.top + playerSize) / maxDim
  })
}
