import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, Alert
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import Database from '../../utils/Database';

// components
import Photo from '../common/Photo';
import Avatar from '../profiles/Avatar';
import OutlineText from '../common/OutlineText';
import CircleIcon from '../common/CircleIcon';

export default class ContestPhotoCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    // database
    this.ref = Database.ref(
      `entries/${
        this.props.contestId
      }/${
        this.props.entryId
      }`
    );
  }

  componentDidMount() {
    this.listener = this.ref.on('value', data => {
      if (data.exists()) {
        this.setState(data.val());
      }
    });
  }

  componentWillUnmount() {
    this.listener && this.ref.off('value', this.listener);
  }

  render() {
    return (
      <View style={styles.container}>
        <Photo
          photoId={this.state.photoId}
          style={styles.photo}>
          <View style={styles.statusContainer}>
            {
              this.props.selected === true
              && (
                <CircleIcon />
              ) || this.props.selected === false
              && (
                <CircleIcon color='red' icon='close' />
              )
            }
            <OutlineText
              style={styles.statusCounter}
              text={`${
                this.props.i || 1
              } of ${
                this.props.n || 1
              }`} />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.avatar}>
              <Avatar
                outline
                outlineColor={Colors.ModalBackground}
                size={48}
                uid='ht33R6YWUWQMc8SZb27o9BOzn6G3' />
            </View>
            <Text style={styles.name}>
              {
                `entries/${
                  this.props.contestId
                }/${
                  this.props.entryId
                }`
              }
            </Text>
            <View style={styles.userContainer}>
              <View style={styles.statContainer}>
                <Text style={styles.statTitle}>
                  24
                </Text>
                <Text style={styles.statDescription}>
                  CONTESTS WON
                </Text>
              </View>
              <View style={styles.statContainer}>
                <Text style={styles.statTitle}>
                  66%
                </Text>
                <Text style={styles.statDescription}>
                  SUCCESS RATE
                </Text>
              </View>
              <View style={styles.statContainer}>
                <Text style={styles.statTitle}>
                  382
                </Text>
                <Text style={styles.statDescription}>
                  PHOTOS
                </Text>
              </View>
            </View>
          </View>
        </Photo>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    shadowColor: Colors.Overlay,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },

  photo: {
    padding: Sizes.InnerFrame,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: Sizes.Width / 1.15,
    height: Sizes.Width * 1.15,
    borderRadius: 15,
    overflow: 'hidden'
  },

  statusContainer: {
    flexDirection: 'row'
  },

  statusCounter: {
    marginLeft: Sizes.InnerFrame / 2
  },

  infoContainer: {
    minHeight: Sizes.InnerFrame * 5,
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.ModalBackground,
    borderRadius: 5
  },

  avatar: {
    marginTop: -Sizes.InnerFrame * 1.5
  },

  userContainer: {
    flexDirection: 'row',
    padding: Sizes.InnerFrame,
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: Colors.Foreground,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  },

  name: {
    padding: Sizes.InnerFrame / 2,
    paddingBottom: Sizes.InnerFrame / 1.5,
    fontSize: Sizes.H3,
    fontWeight: '500'
  },

  statContainer: {
  },

  statTitle: {
    fontSize: Sizes.H4,
    fontWeight: '500',
    color: Colors.SubduedText
  },

  statDescription: {
    fontSize: Sizes.SmallText,
    fontWeight: '100',
    color: Colors.SubduedText
  }
});
