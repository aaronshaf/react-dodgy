import React from 'react'

const style = () => {
  return {
    container: {
      textAlign: 'center'
    },
    info: {
      display: 'flex',
      flexFlow: 'row nowrap',
      justifyContent: 'space-around'
    }
  }
}

// Props
// {
//   timeElapsed: PropTypes.number.isRequired,
//   playerScore: PropTypes.number.isRequired,
//   highScore: PropTypes.number.isRequired
//   // globalHighScore: PropTypes.number
// }

const GameInfo = ({
  timeElapsed,
  playerScore,
  highScore,
  globalHighScore = 'Loading...'
}) => {
  const { container, info } = style()
  return (
    <div style={container}>
      <h3>Use arrows to move.</h3>
      <div style={info}>
        <p>Time: {timeElapsed}</p>
        <p>Score: {playerScore}</p>
      </div>
      <div style={info}>
        <p>High Score: {highScore}</p>
        <p>Global High Score: {globalHighScore}</p>
      </div>
    </div>
  )
}

export default GameInfo
