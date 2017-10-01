import React, { Component } from 'react'
import Game from './Game'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">react-dodgy-game</h1>
        </header>
        <Game boardSize={11} playerSize={25} />
      </div>
    )
  }
}

export default App
