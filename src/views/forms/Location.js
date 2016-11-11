import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import {
  Actions
} from 'react-native-router-flux';

// components
import Field from '../../components/common/Field';
import CaptureLocation from '../../components/common/CaptureLocation'
import Icon from 'react-native-vector-icons/MaterialIcons';

export default class Location extends Component {
  render() {
    return (
      <Field {...this.props}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => Actions.modal({
            view: <CaptureLocation />
         })}>
          <View style={styles.locationContainer}>
            <Icon
              name='check'
              size={18}
              color={Colors.Primary}/>
          </View>
        </TouchableOpacity>
        </View>
      </Field>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingRight: Sizes.InnerFrame
  }
});
