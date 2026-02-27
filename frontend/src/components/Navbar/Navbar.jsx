import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
    return (
        <div className='navbar'>
            <img src={assets.logo} alt="UniTrade Logo" className="logo" />
            <ul className="navbar-menu">
                <li>home</li>
                <li>menu</li>
                <li>mobile app</li>
                <li>contact us</li>
                <li>test</li>
            </ul>
            <dev className="navbar-right">
                <img src={assets.search_icon} alt="" />
                <dev className="navbar-search-icon">
                    <img src={assets.basket_icon} alt="" />
                    <div className="dot"></div>
                </dev>
                <button>sign in</button>
            </dev>
        </div>
    )
}

export default Navbar
