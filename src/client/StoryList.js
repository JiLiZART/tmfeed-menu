import React from 'react'
import Story from './Story.js'
import _ from 'lodash'

export default class StoryList extends React.Component {
  render () {
    var onUrlClick = this.props.onUrlClick;
    var onMarkAsRead = this.props.onMarkAsRead;
    var storyNodes = _.map(this.props.stories, function (story, index) {
      return (
        <div key={index} className='story-list__item'>
          <Story story={story} onUrlClick={onUrlClick} onMarkAsRead={onMarkAsRead}/>
        </div>
      )
    });

    return (
      <div className='story-list'>
        {storyNodes}
      </div>
    )
  }
}

StoryList.propTypes = {
  onUrlClick: React.PropTypes.func.isRequired,
  onMarkAsRead: React.PropTypes.func.isRequired,
  stories: React.PropTypes.array.isRequired
};
