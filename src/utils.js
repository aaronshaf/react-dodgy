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
  return enemies.filter(enemy => enemy.remove !== true).reduce((
    state,
    enemy
  ) => {
    let directLeftDanger = 0
    let directTopDanger = 0
    let directRightDanger = 0
    let directBottomDanger = 0

    let indirectLeftDanger = 0
    let indirectTopDanger = 0
    let indirectRightDanger = 0
    let indirectBottomDanger = 0

    const isOnSameRow = enemy.top === playerPosition.top
    const isOnSameColumn = enemy.left === playerPosition.left
    const isEnemyToTheLeft = enemy.left < playerPosition.left
    const isEnemyAbove = enemy.top < playerPosition.top

    if (isOnSameRow) {
      if (isEnemyToTheLeft) {
        directLeftDanger =
          (maxDim - (playerPosition.left - enemy.left)) / maxDim
      } else {
        directRightDanger =
          (maxDim - (enemy.left - playerPosition.left + playerSize)) / maxDim
      }
    } else if (isOnSameColumn) {
      if (isEnemyAbove) {
        directTopDanger = (maxDim - (playerPosition.top - enemy.top)) / maxDim
      } else {
        directBottomDanger =
          (maxDim - (enemy.top - playerPosition.top + playerSize)) / maxDim
      }
    } else {
      const distance =
        (maxDim -
          getDistance(
            playerPosition.left,
            playerPosition.top,
            enemy.left,
            enemy.top
          )) /
        maxDim
      if (isEnemyToTheLeft) {
        if (isEnemyAbove) {
          if (['RIGHT', 'DOWN'].includes(enemy.dir)) {
            indirectLeftDanger = distance
          }
        } else {
          if (['RIGHT', 'UP'].includes(enemy.dir)) {
            indirectLeftDanger = distance
          }
        }
      } else {
        if (isEnemyAbove) {
          if (['LEFT', 'DOWN'].includes(enemy.dir)) {
            indirectRightDanger = distance
          }
        } else {
          if (['LEFT', 'UP'].includes(enemy.dir)) {
            indirectRightDanger = distance
          }
        }
      }

      if (isEnemyAbove) {
        if (isEnemyToTheLeft) {
          if (['RIGHT', 'DOWN'].includes(enemy.dir)) {
            indirectTopDanger = distance
          }
        } else {
          if (['LEFT', 'DOWN'].includes(enemy.dir)) {
            indirectTopDanger = distance
          }
        }
      } else {
        if (isEnemyToTheLeft) {
          if (['RIGHT', 'UP'].includes(enemy.dir)) {
            indirectBottomDanger = distance
          }
        } else {
          if (['LEFT', 'UP'].includes(enemy.dir)) {
            indirectBottomDanger = distance
          }
        }
      }
    }

    return {
      ...state,
      leftDanger: Math.max(
        state.directLeftDanger,
        directLeftDanger,
        indirectLeftDanger
      ),
      topDanger: Math.max(
        state.directTopDanger,
        directTopDanger,
        indirectTopDanger
      ),
      rightDanger: Math.max(
        state.directRightDanger,
        directRightDanger,
        indirectRightDanger
      ),
      bottomDanger: Math.max(
        state.directBottomDanger,
        directBottomDanger,
        indirectBottomDanger
      )
    }
  }, {
    directLeftDanger: (maxDim - playerPosition.left) / maxDim,
    directTopDanger: (maxDim - playerPosition.top) / maxDim,
    directRightDanger: (playerPosition.left + playerSize) / maxDim,
    directBottomDanger: (playerPosition.top + playerSize) / maxDim
    // leftWallProximity: (maxDim - playerPosition.left) / maxDim,
    // topWallProximity: (maxDim - playerPosition.top) / maxDim,
    // rightWallProximity: (playerPosition.left + playerSize) / maxDim,
    // bottomWallProximity: (playerPosition.top + playerSize) / maxDim
  })
}

function getDistance(x1, y1, x2, y2) {
  const a = x1 - x2
  const b = y1 - y2
  return Math.sqrt(a * a + b * b)
}
