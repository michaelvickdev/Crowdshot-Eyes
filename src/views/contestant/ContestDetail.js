import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, ScrollView, ListView,
  TouchableOpacity, Alert
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import {
  Actions
} from 'react-native-router-flux';
import Database from '../../utils/Database';
import DateFormat from 'dateformat';

// components
import Button from '../../components/common/Button';
import InputSectionHeader from '../../components/common/InputSectionHeader';
import Photo from '../../components/common/Photo';
import Divider from '../../components/common/Divider';
import OutlineText from '../../components/common/OutlineText';
import CircleIconInfo from '../../components/common/CircleIconInfo';
import ContestThumbnail from '../../components/lists/ContestThumbnail';
import GroupAvatar from '../../components/profiles/GroupAvatar';
import CircleIcon from '../../components/common/CircleIcon';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';
import * as Progress from 'react-native-progress';

export default class ContestDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateCreated: Date.now(),
      currentTime: Date.now(),
      progress: 0,
      entries: {},
      thumbnails: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      })
    };

    this.ref = Database.ref(
      `contests/${this.props.contest.contestId}`
    );
    this.entriesRef = Database.ref(
      `entries/${this.props.contest.contestId}`
    );

    this.updateProgress = this.updateProgress.bind(this);
  }

  componentDidMount() {
    this.listener = this.ref.on('value', data => {
      if (data.exists()) {
        this.setState({
          ...data.val()
        });

        this.updateProgress();
      }
    });

    this.entriesListener = this.entriesRef.on('value', data => {
      if (data.exists()) {
        let entries = data.val();
        this.setState({
          entries: entries,
          thumbnails: this.state.thumbnails.cloneWithRows(
            Object.keys(entries)
          )
        });
      }
    });
  }

  updateProgress() {

    // clear previous, just in case this was an interrupt
    this.progress && clearTimeout(this.progress);
    let duration = parseInt(this.state.endDate) - parseInt(this.state.dateCreated);
    let elapsed = Date.now() - parseInt(this.state.dateCreated);
    this.setState({
      progress: (
        (duration !== 0)
        ? (
          (elapsed < duration)
          ? elapsed / duration
          : 1
        ): 0
      )
    });

    // refresh
    this.progress = setTimeout(this.updateProgress, 20000);
  }

  componentWillUnmount() {
    this.listener && this.ref.off('value', this.listener);
    this.entriesListener && this.entriesRef.off('value', this.entriesListener);
    this.progress && clearTimeout(this.progress);
  }

  render() {
    return (
      <View style={styles.container}>
        <Photo
          photoId={this.state.referencePhotoId}
          style={styles.header}>
          <OutlineText
            text={
              `$${
                this.state.bounty || 0
              } Bounty To Top ${
                this.state.prizes
                ? Object.keys(this.state.prizes).length
                : 'Photo'
              }`} />
        </Photo>
        <View style={styles.body}>
          <ScrollView style={styles.detailContainer}>
            <View style={styles.progressContainer2}>
            {
              this.state.progress < 1
              ? (
                <Text style={styles.progressStaticText}>
                  Ending {DateFormat(this.state.endDate, 'dddd, h:MMTT')}
                </Text>
              ):
                <Text style={styles.progressStaticText}>
                  CONTEST ENDED
                </Text>
            }
            </View>
            <Divider style={styles.divider} />
            <View style={styles.summary}>
              <CircleIconInfo
                size={Sizes.H2}
                color={Colors.Foreground}
                icon='location-city'
                label='Near Queen St W and Spadina' />
              <CircleIconInfo
                size={Sizes.H2}
                color={Colors.Foreground}
                icon='burst-mode'
                label={
                  `${
                    Object.keys(this.state.entries).length
                  } entries submitted from ${
                    Object.keys(
                      Object.values(this.state.entries).reduce(
                        (a, b) => (
                          {
                            photographers: Object.assign(
                              a.photographers || {},
                              b.photographers || {},
                              {[a.createdBy]: true},
                              {[b.createdBy]: true}
                            )
                          }
                        ), {photographers: {}}
                      ).photographers
                    ).filter(key => key != 'undefined').length
                  } photographers`
                } />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.instructionContainer}>
              <InputSectionHeader label='Instructions' />
              <Text style={styles.instructions}>
                {this.state.instructions}
              </Text>
            </View>
          </ScrollView>
        </View>
        <Button
          color={Colors.Primary}
          onPress={this.buttonOnPress}
          label={"Participate"}
          squareBorders={10}
          style={styles.buttonStyle}>
        </Button>
        <CloseFullscreenButton/>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
  },

  header: {
    height: Sizes.Height*0.4,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    alignSelf: 'stretch',
    padding: Sizes.InnerFrame
  },

  body: {
    flex: 1,
    backgroundColor: Colors.ModalBackground,
  },

  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.OuterFrame,
    backgroundColor: Colors.DarkOverlay
  },

  progressContainer2: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.OuterFrame,
    backgroundColor: Colors.ModalBackground
  },

  progressTextContainer: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },

  progressUpsellContainer: {
    padding: Sizes.InnerFrame / 2,
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'center'
  },

  progressUpsellText: {
    color: Colors.SubduedText,
    fontSize: Sizes.SmallText,
    fontWeight: '700'
  },

  progressStaticText: {
    color: Colors.SubduedText,
    fontSize: Sizes.Text,
    fontWeight: '700'
  },

  progressUpsellIcon: {
    marginLeft: Sizes.InnerFrame / 3,
  },

  progressTextEnd: {
    padding: Sizes.InnerFrame / 2,
    paddingTop: 0,
    color: Colors.SubduedText,
    fontWeight: '700'
  },

  detailContainer: {
    flex: 1,
    paddingBottom: Sizes.OuterFrame * 10,
  },

  summary: {
    padding: Sizes.InnerFrame
  },

  instructionContainer: {
    marginTop: Sizes.InnerFrame,
  },

  instructions: {
    marginLeft: Sizes.InnerFrame,
    marginRight: Sizes.InnerFrame,
    color: Colors.AlternateText,
    fontWeight: '100'
  },

  photographersNearby: {
    marginLeft: Sizes.InnerFrame,
    justifyContent: 'flex-start'
  },

  photoContainer: {
    marginTop: Sizes.InnerFrame,
    marginBottom: Sizes.OuterFrame * 3,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },

  button: {
    paddingTop: Sizes.InnerFrame / 2,
    paddingBottom: Sizes.InnerFrame / 2,
    paddingLeft: Sizes.InnerFrame / 2,
    paddingRight: Sizes.InnerFrame / 2
  },

  thumbnailContainer: {
    flex: 1,
    marginLeft: Sizes.InnerFrame,
    marginRight: Sizes.InnerFrame,
    alignSelf: 'stretch'
  },

  thumbnails: {
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center'
  },

  buttonStyle: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'stretch'
  }
});