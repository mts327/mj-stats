import React, { Component } from 'react';
import './Button.css';

class Button extends Component {
    render() {
        const { buttonName, onClick } = this.props;

        return (
            <button className='button' onClick={onClick}>{buttonName}</button>
        );
    }
}

export default Button;