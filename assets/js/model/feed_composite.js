// Created by Serge P <contact@sergerusso.com> on 10/22/16.

class FeedComposite extends Feed{


  constructor(data = {}) {
    super(data)
    this.feeds = [];
    this.countRead = data.countRead
    this.isComposite = true
  }

  //todo refactor this:
  unreadCount() {
    return this.items.filter(item => !item.read || this.countRead).length
  }

  markRead(item) {
    if (item) {
      let index = this.items.indexOf(item)
      this.feeds[index].markRead(item)
    } else {
      this.feeds.forEach(feed => feed.markRead())
    }
  }

  toggleMark(item) {
    let index = this.items.indexOf(item)
    this.feeds[index].toggleMark(item)
  }

}