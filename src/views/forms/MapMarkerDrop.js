import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, DeviceEventEmitter,
  Platform, StatusBar
} from 'react-native';
import {
  Colors, Sizes, Styles
} from '../../Const';
import * as Firebase from 'firebase';
import Database from '../../utils/Database';
import GeoFire from 'geofire';
import {
  Actions
} from 'react-native-router-flux';

// consts
const LAT_DELTA = 0.01;
const LNG_DELTA = 0.01;
const MARKER_SIZE = 30;

// components
import RNGLocation from 'react-native-google-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TitleBar from '../../components/common/TitleBar';
import MapView from 'react-native-maps';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';
import Button from '../../components/common/Button';
import ProfileRankPin from '../../components/lists/ProfileRankPin';

export default class MapMarkerDrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      motion: false,
      current: {

        // default location is Toronto
        latitude: 43.6525,
        longitude: -79.381667,
        latitudeDelta: LAT_DELTA,
        longitudeDelta: LNG_DELTA
      },
      profiles: {},
    };

    this.mounted = true;

    this.ref = new GeoFire(
      Database.ref('profileLocations')
    ).query({
      center: [
        this.state.current.latitude,
        this.state.current.longitude
      ],
      radius: GeoFire.distance(
        [this.state.current.latitude, this.state.current.longitude],
        [
          Math.min(90, Math.max(-90, this.state.current.latitude
            + this.state.current.latitudeDelta / 2)),
          Math.min(180, Math.max(-180, this.state.current.longitude
            + this.state.current.longitudeDelta / 2))
        ]
      )
    });

    this.onRegionChange = this.onRegionChange.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.select = this.select.bind(this);
    this.stopMotion = this.stopMotion.bind(this);
  }

  componentDidMount() {
    if (Platform.OS === 'ios'){
      navigator.geolocation.getCurrentPosition(
        position => {
          if (this.mounted){
            this.setState({
              current: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: LAT_DELTA,
                longitudeDelta: LNG_DELTA
              }
            })
          }
        },
        error => console.log(error),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 1000
        }
      );
    } else {
      StatusBar.setBackgroundColor(Colors.Background, false);
      if (!this.evEmitter) {

        // Register Listener Callback - has to be removed later
        this.evEmitter = DeviceEventEmitter.addListener(
          'updateLocation',
          this.onLocationChange
        );

        // Initialize RNGLocation
        RNGLocation.getLocation();
      }
    }

    // and update when a new profile comes into view
    this.ref.on('key_entered', (profileId, location, distance) => {

      // add to seen profiles only if not self
      if (profileId !== Firebase.auth().currentUser.uid) {
        this.state.profiles[profileId] = {
          latitude: location[0],
          longitude: location[1]
        };
      }
    });
  }

  onLocationChange (e: Event) {
    if (this.mounted){
      this.setState({
        current: {
          latitude: e.Latitude,
          longitude: e.Longitude,
          latitudeDelta: LAT_DELTA,
          longitudeDelta: LNG_DELTA
        }
      })
    }

    this.evEmitter && this.evEmitter.remove();
  }

  select() {

    // outer callback
    this.props.onSelected && this.props.onSelected(
      [
        this.state.current.latitude,
        this.state.current.longitude
      ]
    );

    // out
    Actions.pop();
  }

  // helps avoid jitterness by delaying reappear
  stopMotion() {
    this.motion = setTimeout(() => {
      if (this.mounted){
        this.setState({
          motion: false
        }), 50
      }
    });
  }

  onRegionChange(region, motion) {
    if (this.mounted){
      this.ref.updateCriteria({
        center: [
          region.latitude,
          region.longitude
        ],
        radius: GeoFire.distance(
          [region.latitude, region.longitude],
          [
            Math.min(90, Math.max(-90, region.latitude
              + region.latitudeDelta / 2)),
            Math.min(180, Math.max(-180, region.longitude
              + region.longitudeDelta / 2))
          ]
        )
      });

      // helps avoid jitterness by delaying reappear
      this.motion && clearTimeout(this.motion);
      if (motion) this.setState({
        current: region,
        motion: true
      }); else this.stopMotion();
    }
  }

  componentWillUnmount() {
    this.ref.cancel();
    this.mounted = false;
    this.evEmitter && this.evEmitter.remove();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MapView
            ref='map'
            showsUserLocation
            showsMyLocationButton={false}
            rotateEnabled={false}
            pitchEnabled={false}
            provider={MapView.PROVIDER_GOOGLE}
            customMapStyle={Styles.MapStyle}
            style={styles.map}
            region={this.state.current}
            onRegionChange={region => this.onRegionChange(
              region, true
            )}
            onRegionChangeComplete={region => this.onRegionChange(
              region, false
            )}>
            {
              Object.keys(this.state.profiles).map(profileId => {
                let markerSizes = _scaleMarker(
                  this.state.current.latitudeDelta
                );

                return (
                  <MapView.Marker
                    key={profileId}
                    coordinate={this.state.profiles[profileId]}>
                    <ProfileRankPin
                      profileId={profileId}
                      innerSize={10}
                      outerSize={12} />
                  </MapView.Marker>
                );
              })
            }
          </MapView>
        </View>
        <TitleBar
          title='Select the Contest Location'
          style={[
            styles.titleContainer,
            this.state.motion && {
              height: 0,
              padding: 0,
              paddingTop: 0
            }
          ]} />
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.select}
            style={
              this.state.motion && {
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                height: 0
              }
            }
            squareBorders
            color={Colors.Primary}
            label='Set Location' />
        </View>
        <View style={styles.pinShadow}>
          <View style={styles.pinContainer}>
            <Icon
              name='flag'
              color={Colors.Primary}
              size={48} />
          </View>
        </View>
        <CloseFullscreenButton
          hide={Platform.OS !== 'ios'}
          back={!this.props.closeAction}
          action={this.props.closeAction} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.Background
  },

  content: {
    flex: 1
  },

  map: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  pinContainer: {
    alignItems: 'center'
  },

  pinShadow: {
    position: 'absolute',
    top: Sizes.Height / 2 - Sizes.InnerFrame * 3.5,
    left: Sizes.Width / 2 - Sizes.InnerFrame,
    backgroundColor: Colors.Transparent,
    shadowColor: Colors.Overlay,
    shadowOpacity: 1,
    shadowRadius: 5,
    shadowOffset: {
      height: Sizes.InnerFrame / 2,
      width: 0
    }
  },

  titleContainer: {
    width: Sizes.Width,
    position: 'absolute',
    top: 0
  },

  buttonContainer: {
    width: Sizes.Width,
    padding: Sizes.InnerFrame,
    position: 'absolute',
    bottom: 0
  }
});

// scale markers with min and max sizes as pinch to zoom
function _scaleMarker(delta) {
  return {
    outer: Math.max(
      MARKER_SIZE / 2,
      Math.min(
        MARKER_SIZE,
        MARKER_SIZE / delta * LAT_DELTA
      )
    ), inner: Math.max(
      (MARKER_SIZE - 8) / 2,
      Math.min(
        (MARKER_SIZE - 8),
        (MARKER_SIZE - 8) / delta * LAT_DELTA
      )
    )
  };
}
