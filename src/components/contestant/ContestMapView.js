import React, {
  Component
} from 'react';
import {
  StyleSheet, View, Text, Animated, PanResponder,
  ListView
} from 'react-native';
import {
  Sizes, Colors
} from '../../Const';

// components
import MapView from 'react-native-maps';
import ContestSummaryCard from '../../components/contestant/ContestSummaryCard';

const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = 0.01;


export default class ContestMapView extends Component {
  constructor(props) {
    super(props);


    this.state = {
      selected: 0,
      currentCoord:{
        latitude: 0,
        longitude: 0,
      },
      region: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      contests: [],
      data: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      }),
    };

  }

  componentDidMount() {
    let contests = [];

    navigator.geolocation.getCurrentPosition(
      (position) => {
        contests.push({
          id: 0,
          contestId: 'testContest',
          amount: 5,
          selected: false,
          coordinate: {
            latitude: position.coords.latitude + 0.002,
            longitude: position.coords.longitude + 0.004,
          },
          description: "Contest 1"
        });
        contests.push({
          id: 1,
          contestId: 'testContest',
          amount: 10,
          selected: false,
          coordinate: {
            latitude: position.coords.latitude - 0.002,
            longitude: position.coords.longitude + 0.002,
          },
          description: "Contest 2"
        });
        contests.push({
          id: 2,
          contestId: 'testContest',
          amount: 15,
          selected: false,
          coordinate: {
            latitude: position.coords.latitude + 0.003,
            longitude: position.coords.longitude + 0.001,
          },
          description: "Contest 3"
        });
        contests.push({
          id: 3,
          contestId: 'testContest',
          amount: 15,
          selected: false,
          coordinate: {
            latitude: position.coords.latitude + 0.0035,
            longitude: position.coords.longitude - 0.001,
          },
          description: "Contest 4"
        });
        contests.push({
          id: 4,
          contestId: 'testContest',
          amount: 15,
          selected: false,
          coordinate: {
            latitude: position.coords.latitude - 0.004,
            longitude: position.coords.longitude + 0.001,
          },
          description: "Contest 5"
        });
        contests.push({
          id: 5,
          contestId: 'testContest',
          amount: 15,
          selected: false,
          coordinate: {
            latitude: position.coords.latitude + 0.002,
            longitude: position.coords.longitude + 0.0015,
          },
          description: "Contest 6"
        });

        const region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        contests[0].selected = true;

        this.setState({
          currentCoord: position.coords,
          contests,
          region,
          data: this.state.data.cloneWithRows(contests),
          init: true
        });

        this.map.fitToCoordinates(contests.map((m,i) => m.coordinate), {
          edgePadding: {top:50,right:50,bottom:50,left:50},
          animated: true,
        });
      },
      (error) => console.log(JSON.stringify(error)),
        {enableHighAccuracy: false, timeout: 50000, maximumAge: 1000}
    );
  }

  onRegionChange= (region) => {
    this.setState({region});
  }

  onScroll = (event) => {
    let {contests, currentCoord, selected, region} = this.state

    let index = Math.round(event.nativeEvent.contentOffset.x /
      (Sizes.Width - Sizes.OuterFrame * 2));

    if (selected != index){

      if (region.latitude - region.latitudeDelta/2
            > contests[index].coordinate.latitude
          || region.latitude + region.latitudeDelta/2
            < contests[index].coordinate.latitude
          || region.longitude - region.longitudeDelta/2
            > contests[index].coordinate.longitude
          || region.longitude + region.longitudeDelta/2
            < contests[index].coordinate.longitude
          || region.latitude - region.latitudeDelta/2
            > currentCoord.latitude
          || region.latitude + region.latitudeDelta/2
            < currentCoord.latitude
          || region.longitude - region.longitudeDelta/2
            > currentCoord.longitude
          || region.longitude + region.longitudeDelta/2
            < currentCoord.longitude){
        this.map.fitToCoordinates([currentCoord, contests[index].coordinate], {
          edgePadding: {top:50,right:50,bottom:50,left:50},
          animated: true,
        });
      }

      contests.forEach(contest => {
        contest.selected = false;
      });
      contests[index].selected = true;
      this.setState({contests,selected: index})
    }
  }

  onMarkerPress(marker){
    console.log("onMarkerPress,",marker);
    let index = marker.id;
    let { contests } = this.state;

    contests.forEach(contest => {
      contest.selected = false;
    });
    contests[index].selected = true;
    this.setState({contests,selected: index})
  }


  render() {
    const {
      contests,
      region,
      currentCoord,
    } = this.state;

   return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <ListView
            ref={ref => {this.listview = ref;}}
            horizontal
          //  pagingEnabled
          //  pageSize={3}
            removeClippedSubviews={true}
            dataSource={this.state.data}
        //    style={this.getListViewStyle()}
            contentContainerStyle={styles.lists}
            onScroll={this.onScroll}
            renderRow={
              (rowData, s, i) => {
                return (
                  <View
                    key={i}>
                    <ContestSummaryCard contest={rowData} />
                  </View>
                );
              }
            } />
          <View style={styles.mapContainer}>
            <MapView
              ref={ref => {this.map = ref;}}
              style={styles.map}
              initialRegion={this.state.region}
              onRegionChangeComplete={this.onRegionChange}>
              <MapView.Marker
                coordinate={currentCoord}>
                <View style={styles.ownMarker}/>
              </MapView.Marker>
              {contests.map((contest, i) => {
                const {
                  selected,
                  amount,
                } = contest

                return (
                  <MapView.Marker
                    coordinate={contest.coordinate}
                    key={contest.id}
                    onPress={() => this.onMarkerPress(contest)}>
                    {selected ?
                    <View style={styles.markerWrapper}>
                      <View style={[styles.marker, styles.markerSelected]}>
                        <Text style={styles.selectedText}>
                          {"$" + amount}
                        </Text>
                      </View>
                      <View style={[styles.markerArrow,styles.selectedArrow]}/>
                    </View>
                    :
                    <View style={styles.markerWrapper}>
                      <View style={styles.marker}>
                        <Text style={styles.text}>
                          {"$" + amount}
                        </Text>
                      </View>
                      <View style={styles.markerArrow}/>
                    </View>
                    }
                  </MapView.Marker>
                );
              })}
            </MapView>
            {this.state.init ||
            <View style={styles.buttonContainer}>
              <View style={styles.bubble}>
                <Text style={styles.text}>Loading</Text>
              </View>
            </View>
            }
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.Background,
  },

  container: {
    flex: 1,
    alignSelf: 'stretch',
  },

  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    marginBottom: 50 + Sizes.Height*0.25,
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  bubble: {
    backgroundColor: Colors.Overlay,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
  },

  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  text: {
    color: Colors.Text,
    fontWeight: '600'
  },

  selectedText: {
    color: Colors.Text,
    fontWeight: '800',
    fontSize: Sizes.H4
  },

  lists: {
    alignSelf: 'flex-end',
    marginBottom: 50,
    paddingHorizontal: 20,
    paddingBottom: 5,
  },

  markerWrapper: {
    alignItems: 'center'
  },

  marker: {
    borderRadius: 5,
    borderWidth: 0,
    paddingHorizontal: 3,
    backgroundColor: Colors.MediumDarkOverlay,
  },

  markerSelected: {
    backgroundColor: Colors.Primary,
  },

  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: Colors.Transparent,
    borderStyle: 'solid',
    borderTopWidth: 6,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderLeftColor: Colors.Transparent,
    borderRightColor: Colors.Transparent,
    borderTopColor: Colors.MediumDarkOverlay
  },

  selectedArrow: {
    borderTopColor: Colors.Primary
  },

  ownMarker: {
    width: 20,
    height: 20,
    borderRadius: 20/2,
    backgroundColor: Colors.Primary,
    borderColor: Colors.ModalBackground,
    borderWidth: 3,
    shadowColor: Colors.DarkOverlay,
    shadowOpacity: 1,
    shadowRadius: 3,
    shadowOffset: {
      height: 1,
    },
  }



});
