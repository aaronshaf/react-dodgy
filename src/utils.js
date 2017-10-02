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
      directLeftDanger: Math.max(state.directLeftDanger, directLeftDanger),
      directTopDanger: Math.max(state.directTopDanger, directTopDanger),
      directRightDanger: Math.max(state.directRightDanger, directRightDanger),
      directBottomDanger: Math.max(
        state.directBottomDanger,
        directBottomDanger
      ),
      indirectLeftDanger: Math.max(
        state.indirectLeftDanger,
        indirectLeftDanger
      ),
      indirectTopDanger: Math.max(state.indirectTopDanger, indirectTopDanger),
      indirectRightDanger: Math.max(
        state.indirectRightDanger,
        indirectRightDanger
      ),
      indirectBottomDanger: Math.max(
        state.indirectBottomDanger,
        indirectBottomDanger
      )
    }
  }, {
    directLeftDanger: 0,
    directTopDanger: 0,
    directRightDanger: 0,
    directBottomDanger: 0,
    indirectLeftDanger: 0,
    indirectTopDanger: 0,
    indirectRightDanger: 0,
    indirectBottomDanger: 0,
    leftWallProximity: (maxDim - playerPosition.left) / maxDim,
    topWallProximity: (maxDim - playerPosition.top) / maxDim,
    rightWallProximity: (playerPosition.left + playerSize) / maxDim,
    bottomWallProximity: (playerPosition.top + playerSize) / maxDim
  })
}

function getDistance(x1, y1, x2, y2) {
  const a = x1 - x2
  const b = y1 - y2
  return Math.sqrt(a * a + b * b)
}
