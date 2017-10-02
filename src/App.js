import React, { Component } from 'react'
import Game from './Game'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Game boardSize={12} playerSize={25} />
      </div>
    )
  }
}

export default App
