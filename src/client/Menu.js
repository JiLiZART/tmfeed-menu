import React from 'react'

export default class Menu extends React.Component {
    handleOnClick(e) {
        e.preventDefault();
        this.props.onQuitClick()
    }

    render() {
        var statusText = 'Версия ' + this.props.version;
        var buttonText = 'Закрыть';

        if (this.props.status === 'update-available') {
            statusText += ' (доступна версия ' + this.props.upgradeVersion + ' , перезапустите для апдейта)';
            buttonText = 'Перезапустить';
        }

        return (
            <div className='bar bar-standard bar-footer'>
                <button className='btn pull-left'>{statusText}</button>
                <button className='btn pull-right' onClick={this.handleOnClick.bind(this)}>
                    {buttonText}
                </button>
            </div>
        )
    }
}

Menu.propTypes = {
    status: React.PropTypes.string.isRequired,
    version: React.PropTypes.string.isRequired,
    upgradeVersion: React.PropTypes.string.isRequired,
    onQuitClick: React.PropTypes.func.isRequired
};
