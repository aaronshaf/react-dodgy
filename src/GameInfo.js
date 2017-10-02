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
  globalHighScore = 'Loading...',
  currentNetworkIndex,
  generation
}) => {
  const { container, info } = style()
  return (
    <div style={container}>
      <div style={info}>
        <p>Time: {timeElapsed}</p>
        <p>Score: {playerScore}</p>
      </div>
      <div style={info}>
        <p>Network: {currentNetworkIndex + 1}</p>
        <p>Generation: {generation}</p>
      </div>
    </div>
  )
}

export default GameInfo
