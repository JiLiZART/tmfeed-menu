import React from 'react';

export default class Header extends React.Component {

    handleClick(selection) {
        this.props.onNavClick(selection)
    }

    render() {
        const { types, selected } = this.props;

        var navNodes = types.map((selection) => {
            var className = 'header__menu-link link';

            if (selected === selection) {
                className = className + ' header__menu-link--active';
            }

            return (
                <li key={selection} className="header__menu-item">
                    <a className={className}
                       onClick={() => this.handleClick(selection)}>{selection}</a>
                </li>
            )
        });

        return (
            <header className='header'>
                <ul className='header__menu'>
                    {navNodes}
                </ul>
            </header>
        );
    }
}

Header.propTypes = {
    types: React.PropTypes.array.isRequired,
    selected: React.PropTypes.string.isRequired,
    onNavClick: React.PropTypes.func.isRequired
};