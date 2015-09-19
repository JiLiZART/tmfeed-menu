import React from 'react'
import moment from 'moment';
import 'moment/locale/ru.js';

export default class Story extends React.Component {
    markAsRead() {
        this.props.onMarkAsRead(this.props.story.id);
    }

    openUrl(url) {
        this.props.onUrlClick(url);
    }

    handleExternalUrlOnClick(e) {
        e.preventDefault();
        this.openUrl(this.props.story.url);
    }

    handleUrlClick(e) {
        e.preventDefault();
        this.markAsRead();
        this.openUrl(this.props.story.url);
    }

    render() {
        var story = this.props.story;
        var storyState;

        if (story.hasRead) {
            storyState = 'story story_status_read'
        } else {
            storyState = 'story'
        }

        /**
         {
          id: 19538,
          time_published: '2015-09-18T19:19:46+03:00',
          url: 'http://megamozg.ru/post/19538/',
          title: 'Финтехкомпании могут уровнять в правах и обязанностях с банками',
          score: null,
          comments_count: 0,
          reading_count: 669,
          favorites_count: 2,
          site: 'megamozg'
        }
         */
        let timeAgo = moment(story.time_published).fromNow();

        return (
            <div className={storyState}>
                <h2 className='story__title'
                          onClick={this.handleUrlClick.bind(this)}>{story.title}</h2>

                <div className='story__meta'>
                    <span className={'story__meta-item story__site icon icon_name_site-' + story.site}></span>

                    <span className='story__meta-item story__comments'
                        onClick={this.handleExternalUrlOnClick.bind(this)}>
                        <span>комментарии: </span>
                        <b>{story.comments_count}</b>
                    </span>

                    <span className='story__meta-item story__views'>
                        <span>просмотры: </span>
                        <b>{story.reading_count}</b>
                    </span>

                    <span className='story__meta-item story__favs'>
                        <span>в избранном: </span>
                        <b>{story.favorites_count}</b>
                    </span>

                    <span className='story__meta-item story__date'
                        onClick={this.handleExternalUrlOnClick.bind(this)}>{timeAgo}</span>
                </div>
            </div>
        )
    }
}

Story.propTypes = {
    onUrlClick: React.PropTypes.func.isRequired,
    onMarkAsRead: React.PropTypes.func.isRequired,
    story: React.PropTypes.object.isRequired
};
