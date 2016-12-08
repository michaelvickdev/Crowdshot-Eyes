import React, {
  Component
} from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import {
  Actions
} from 'react-native-router-flux';
import * as Firebase from 'firebase';
import Database from '../../utils/Database';

// components
import Photo from '../common/Photo';
import CircleIconInfo from '../common/CircleIconInfo';
import Avatar from '../profiles/Avatar';
import ChatAvatar from '../profiles/ChatAvatar';

export default class ChatCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contest: {},
      messages: {}
    };

    this.contestRef = Database.ref(
      `contests/${
        this.props.chatId
      }`
    );

    this.chatRef = Database.ref(
      `chats/${
        this.props.chatId
      }`
    );

    // listing of all generated refs and listeners
    this.ref = {};
  }

  componentDidMount() {
    this.contestListener = this.contestRef.on('value', data => {
      if (data.exists()) {
        this.setState({
          contest: data.val()
        });
      }
    });

    this.chatListener = this.chatRef.on(
      'value', data => {
        if (data.exists()) {

          // reset due to new data incoming
          let blob = data.val() || {};
          this.componentWillUnmount(true);
          this.setState({
            last: 0,
            lastAuthor: null,
            messages: blob
          });

          // and generate individual listeners for authors
          // if their message is last (which likely will be
          // every message since database is stored by decreasing
          // date)
          Object.keys(blob).map(date => {
            if (date > this.last) {

              // sync store last date, can't use state
              // since synchronous order not guaranteed
              // and will produce race conditions
              this.last = date;
              this.ref[date] = {};
              this.ref[date].ref = Database.ref(
                `profiles/${
                  blob[date].createdBy
                }/displayName`
              );
              this.ref[date].listener = this.ref[date].ref.on(
                'value', author => {
                  if (
                    author.exists()

                    // need to recompare again since last may have
                    // lapsed and changed due to async on listener
                    // timeframe
                    && this.last === date
                  ) {
                    this.setState({
                      last: date,
                      lastAuthor: author.val()
                    });
                  }
                }
              );
            }
          });
        }
      }
    );
  }

  componentWillUnmount(reset) {
    Object.values(this.ref).map(ref => {
      ref.ref.off('value', ref.listener);
    });

    // not actually unmounting, so prepare for next load
    if (reset) {
      this.ref = {};
      this.last = 0;
    } else {
      this.contestlistener && this.contestRef.off('value', this.contestListener);
      this.chatListener && this.chatRef.off('value', this.chatListenser);
    }
  }

  formattedMessage(message, length) {
    let fmsg = message + '';
    return (
      fmsg.length > length
      ? `${fmsg.substr(0, length)}..`
      : fmsg
    );
  }

  render() {
    return(
      <View style={styles.outline}>
        <TouchableOpacity
          onPress={() => Actions.chat({
            chatId: this.props.chatId,
            title: 'Contest Chat'
          })}>
          <View style={styles.item}>
            <View style={styles.avatar}>
              <ChatAvatar
                uids={[

                  // unique since could be duplicates
                  ...new Set(
                    [
                      ...Object.values(this.state.messages).map(
                        message => message.createdBy
                      ),

                      // inject the contest owner
                      this.state.contest.createdBy
                    ]
                  )
                ].filter(

                  // filter out self profile
                  profileId => (
                    profileId !== Firebase.auth().currentUser.uid
                  )
                )} />
            </View>
            <View style={styles.messageContainer}>
              <Text style={styles.chatTitle}>
                {
                  this.formattedMessage(
                    this.state.lastAuthor || 'Unknown',
                    30
                  )
                }
              </Text>
              <Text style={styles.message}>
                {
                  this.formattedMessage(
                    this.state.last
                    ? this.state.messages[
                      this.state.last
                    ].message: '',
                    30
                  )
                }
              </Text>
            </View>
            <Text style={styles.date}>
              {this.formattedDate(this.state.last)}
            </Text>
            {
              this.props.unread > 0
              && (
                <View style={styles.unreadContainer}>
                  <Text style={styles.unread}>
                    {this.props.unread}
                  </Text>
                </View>
              )
            }
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  formattedDate(time) {

    //Within a day => time
    //Within a week => monday
    //Ow, date
    var date = new Date(Number(time));
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var week = date.getDay();
    // new Day
    var newDate = new Date();
    var newDay = newDate.getDay()
    //Within this week
    var res;
    //Yesterday
    if (week == newDay) {
      if (hour > 12) {
        // Todo: just-now to be added
        res = (hour-12) + ':' + ("0" + (minutes + 1)).slice(-2)  + ' PM'
      } else {
        res = hour + ':' + ("0" + (minutes + 1)).slice(-2) + ' AM'
      }
    } else if (week + 1 == newDay || (week == 6 && newDay == 0)) {
      res = 'Yesterday'
  } else if (newDay - week < 6) {
      //Which day of week
      if (week == 1) {
        res = 'Monday'
      } else if (week == 2) {
        res = 'Tuesday'
      } else if (week == 3) {
        res = 'Wednesday'
      } else if (week == 4) {
        res = 'Thursday'
      } else if (week == 5) {
        res = 'Friday'
      } else if (week == 6) {
        res = 'Satuday'
      } else if (week == 0) {
        res = 'Sunday'
      }
    } else {
      //month 2 digits
      month = ("0" + (month + 1)).slice(-2);

      year = year.toString();

      res = year + "-" + month + "-" + day;
    }
    return res;
  }
}

const styles = StyleSheet.create({
  outline: {
    alignSelf: 'stretch',
    borderLeftWidth: Sizes.InnerFrame / 4,
    borderLeftColor: Colors.ModalForeground,
    backgroundColor: Colors.ModalForeground
  },

  avatar: {
    marginLeft: 0
  },

  photo: {
    width: 50,
    height: 50,
    borderRadius: 5
  },

  item: {
    padding: Sizes.InnerFrame,
    paddingLeft: Sizes.InnerFrame,
    backgroundColor: Colors.ModalForeground,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between'
  },

  chatTitle: {
    fontSize: Sizes.Text,
    color: Colors.AlternateText,
    textAlign: 'left'
  },

  message: {
    fontSize: Sizes.H3,
    color: Colors.SubduedText,
    textAlign: 'left',
    fontStyle:'italic',
    paddingTop: 5
  },

  messageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: Sizes.InnerFrame
  },

  date: {
    color: Colors.AlternateText,
    fontSize: Sizes.Text
  },

  unreadContainer: {
    position: 'absolute',
    right: Sizes.InnerFrame,
    bottom: Sizes.InnerFrame,
    alignSelf: 'center',
    alignItems: 'center',
    padding: Sizes.InnerFrame / 4,
    paddingLeft: Sizes.InnerFrame,
    paddingRight: Sizes.InnerFrame,
    borderRadius: 50,
    backgroundColor: Colors.Cancel
  },

  unread: {
    fontSize: Sizes.SmallText,
    color: Colors.Text,
    fontStyle: 'italic',
    fontWeight: '900'
  }
})
