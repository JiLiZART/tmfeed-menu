import React from 'react';

export default class NavBar extends React.Component {

    handleClick(selection) {
        this.props.onNavClick(selection)
    }

    render() {
        const { types, selected } = this.props;

        var navNodes = types.map((selection) => {
            var className = 'control-item link';

            if (selected === selection) {
                className = className + ' active';
            }

            return (
                <a key={selection} className={className}
                    onClick={() => this.handleClick(selection)}>{selection}</a>
            )
        });

        return (
            <header className='bar bar-standard'>
                <div className='segmented-control'>
                    {navNodes}
                </div>
            </header>
        );
    }
}