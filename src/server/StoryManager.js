import Events from 'events'
import Firebase from 'firebase'
import moment from 'moment'
import URL from 'url'
import request from 'request';
import _ from 'lodash'
import async from 'async'
import StoryType from '../model/StoryType'
import StoryManagerStatus from '../model/StoryManagerStatus'

const API_URL = 'https://tmfeed.firebaseio.com/v0';

export default class StoryManager extends Events.EventEmitter {
    constructor(maxNumOfStories, cache) {
        super();
        this.maxNumOfStories = maxNumOfStories;
        this.fb = new Firebase(API_URL);
        this.cache = cache;
        this.stories = {}
    }

    fetchStory(storyId, callback) {
        var self = this;

        var error = function (err) {
            callback(err)
        };

        var success = function (storySnapshot) {
            var story = storySnapshot.val();

            if (!story) {
                callback(new Error('Error loading ' + storySnapshot.key()));
                return
            }

            story.timeAgo = moment.unix(story.time).fromNow();
            story.yurl = self.getYurl(story.id);
            story.by_url = self.getByUrl(story.by);

            if (_.isEmpty(story.url)) {
                story.url = story.yurl
            } else {
                story.host = URL.parse(story.url).hostname
            }

            if (_.isUndefined(story.descendants)) {
                story.descendants = 0
            }

            if (self.cache.contains(story.id)) {
                story.hasRead = true
            } else {
                story.hasRead = false
            }

            // console.log(JSON.stringify(story, null, 2))

            callback(null, story)
        };

        self.fb.child('item/' + storyId).once('value', success, error)
    }

    fetch(type, callback) {
        var self = this;

        request(this.getUrlByType(type), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(error, JSON.parse(body));
            } else {
                console.error(error);
                callback(error);
            }
        });

        var success = function (storyIds) {
            self.emit('story-manager-status', {type: type, status: StoryManagerStatus.SYNCING_STATUS});

            async.map(storyIds.val(), self.fetchStory.bind(self), function (err, stories) {
                callback(err, stories);

                if (err) {
                    return
                }

                self.emit('story-manager-status', {type: type, status: StoryManagerStatus.UPDATED_STATUS})
            })
        };

        //self.fb
        //  .child(self.getChildName(type))
        //  .limitToFirst(self.maxNumOfStories)
        //  .once('value', success, error)
    }

    watch(type, callback) {
        var self = this;

        if (callback) {
            self.on(type, callback);
        }

        var error = function (err) {
            self.emit(type, err);
        };

        var success = function (storyIds) {
            self.emit('story-manager-status', {type: type, status: StoryManagerStatus.SYNCING_STATUS});

            async.map(storyIds.val(), self.fetchStory.bind(self), function (err, stories) {
                self.emit(type, err, stories);

                if (err) {
                    return
                }

                self.emit('story-manager-status', {type: type, status: StoryManagerStatus.UPDATED_STATUS});

                if (!self.stories[type]) {
                    self.stories[type] = []
                }

                var newStories = self.filterNewStories(stories, self.stories[type]);

                if (!_.isEmpty(newStories)) {
                    self.emit('new-story', newStories)
                }

                self.stories[type] = stories
            })
        };

        //self.fb.child(self.getChildName(type)).limitToFirst(self.maxNumOfStories).on('value', success, error)
    }

    filterNewStories(updatedStories, oldStories) {
        return _.filter(updatedStories, function (story) {
            return !story.hasRead && !_.findWhere(oldStories, {id: story.id})
        })
    }

    getAllUrl() {
        return this.getApiUrl('all', 'alltime');
    }

    getInteresingUrl() {
        return this.getApiUrl('interesting', 'alltime');
    }

    getTopUrl(period) {
        return this.getApiUrl('top', period);
    }

    /**
     * Returns tmfeed.ru formed url
     * @param {String} type
     * @param {String} [period] period, can be 'daily', 'weekly', 'monthly', 'alltime'
     * @param {Array} [resources]
     * @returns {string}
     */
    getApiUrl(type, period = 'alltime', resources = ['habrahabr', 'megamozg', 'geektimes']) {
        return 'http://tmfeed.ru/posts/' + resources.join('-') + '_' + type + '_' + period + '.json';
    }

    getUrlByType(type) {
        if (type === StoryType.TOP_TYPE) {
            return this.getTopUrl('daily');
        } else if (type === StoryType.INTERESTING_TYPE) {
            return this.getInteresingUrl();
        } else if (type === StoryType.ALL_TYPE) {
            return this.getAllUrl();
        } else {
            throw new Error('Unsupported watch type ' + type)
        }
    }
}
