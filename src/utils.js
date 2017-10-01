import React from 'react'

export const puke = obj => <pre>{JSON.stringify(obj, null, 2)}</pre>
export const pluck = arr => arr[Math.floor(Math.random() * arr.length)]

export function getProximities(enemies, playerPosition, maxDim, playerSize) {
  return enemies.reduce(
    (state, enemy) => {
      if (enemy.top === playerPosition.top) {
        if (enemy.left < playerPosition.left) {
          return {
            ...state,
            left: Math.max(
              state.left,
              (maxDim - (playerPosition.left - enemy.left)) / maxDim
            )
          }
        } else {
          return {
            ...state,
            right: Math.max(
              state.right,
              (maxDim - (enemy.left - playerPosition.left + playerSize)) /
                maxDim
            )
          }
        }
      } else if (enemy.left === playerPosition.left) {
        if (enemy.top < playerPosition.top) {
          return {
            ...state,
            top: Math.max(
              state.top,
              (maxDim - (playerPosition.top - enemy.top)) / maxDim
            )
          }
        } else {
          return {
            ...state,
            bottom: Math.max(
              state.bottom,
              (maxDim - (enemy.top - playerPosition.top + playerSize)) / maxDim
            )
          }
        }
      }
      return state
    },
    {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    }
  )
}
