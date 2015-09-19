import React from 'react'
import _ from 'lodash'
import Client from 'electron-rpc/client'
import StoryList from './StoryList.js'
import Spinner from './Spinner.js'
import Footer from './Footer.js'
import Header from './Header.js'
import StoryType from '../model/StoryType.js'

export default class StoryBox extends React.Component {
    constructor(props) {
        super(props);

        this.client = new Client();

        this.state = {
            stories: [],
            selected: StoryType.TOP_TYPE,
            status: '',
            version: '',
            upgradeVersion: ''
        }
    }

    componentDidMount() {
        var self = this;

        self.client.request('current-version', function (err, version) {
            if (err) {
                console.error(err);
                return
            }

            self.setState({version: version})
        });

        self.onNavClick(self.state.selected)
    }

    onQuitClick() {
        this.client.request('terminate')
    }

    onUrlClick(url) {
        this.client.request('open-url', {url: url})
    }

    onMarkAsRead(id) {
        this.client.request('mark-as-read', {id: id}, function () {
            var story = _.findWhere(this.state.stories, {id: id});
            story.hasRead = true;

            this.setState({stories: this.state.stories})
        }.bind(this));
    }

    onNavClick(selected) {
        var self = this;

        self.setState({stories: [], selected: selected});
        self.client.localEventEmitter.removeAllListeners();

        self.client.on('update-available', function (err, releaseVersion) {
            if (err) {
                console.error(err);
                return
            }

            self.setState({status: 'update-available', upgradeVersion: releaseVersion});
        });

        var storyCallback = function (err, storiesMap) {
            if (err) {
                return
            }

            var stories = storiesMap[self.state.selected];

            if (!stories) {
                return
            }

            // console.log(JSON.stringify(stories, null, 2))
            self.setState({stories: stories});
        };

        self.client.request(selected, storyCallback);
        self.client.on(selected, storyCallback);
    }

    render() {
        let content = null;

        if (_.isEmpty(this.state.stories)) {
            content = <Spinner />
        } else {
            content = <StoryList stories={this.state.stories} onUrlClick={this.onUrlClick.bind(this)}
                                 onMarkAsRead={this.onMarkAsRead.bind(this)}/>
        }

        return (
            <div className='story-menu'>
                <Header types={StoryType.ALL}
                    selected={this.state.selected}
                    onNavClick={this.onNavClick.bind(this)}/>

                <section className='content'>
                    {content}
                </section>
                
                <Footer onQuitClick={this.onQuitClick.bind(this)}
                        status={this.state.status}
                        version={this.state.version}
                        upgradeVersion={this.state.upgradeVersion}/>
            </div>
        )
    }
}
