import React from 'react'
import './Square.css'

const style = ({ size, position, color }) => {
  const dim = size + 'px'
  return {
    width: dim,
    height: dim,
    backgroundColor: color,
    position: 'absolute',
    // top: position.top + 'px',
    // left: position.left + 'px',
    transform: `translateX(${position.left}px) translateY(${position.top}px)`,
    transition: 'all 0.1s ease'
  }
}

export default props => <div className="Square" style={style(props)} />
