import React, { Component } from 'react'
import Square from './Square'
import { UP, DOWN, LEFT, RIGHT } from './constants'

// Props
// {
//   size: PropTypes.number.isRequired,
//   position: PropTypes.shape({
//     top: PropTypes.number.isRequired,
//     left: PropTypes.number.isRequired
//   })
// }

class Player extends Component {
  handleKeyDown = e => {
    let newDirection

    switch (e.keyCode) {
      case 37:
        e.preventDefault()
        newDirection = { top: 0, left: -1, dir: LEFT }
        break
      case 38:
        e.preventDefault()
        newDirection = { top: -1, left: 0, dir: UP }
        break
      case 39:
        e.preventDefault()
        newDirection = { top: 0, left: 1, dir: RIGHT }
        break
      case 40:
        e.preventDefault()
        newDirection = { top: 1, left: 0, dir: DOWN }
        break
      default:
        return
    }

    this.props.handlePlayerMovement(newDirection)
  }

  render() {
    const { size, position: { top, left } } = this.props

    return (
      <div
        ref={n => {
          this.player = n
        }}
      >
        <Square size={size} position={{ top, left }} color="darkgray" />
      </div>
    )
  }

  componentDidMount() {
    window.onkeydown = this.handleKeyDown
  }
}

export default Player
