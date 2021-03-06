import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Picker, Modal, TouchableOpacity, Text,
  TouchableWithoutFeedback, Alert, Platform
} from 'react-native';
import {
  Sizes, Colors
} from '../../Const'

// components
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AndroidPicker from 'react-native-picker';

export default class PriceSelectPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      visibleAndroid: false
    }

    // from 20 to 990
    this.options = new Array(98).fill(0).map(
      (v, i) => (i + 2) * 10
    );

    this.androidOptions=[];
    this.options.map(value => (
      this.androidOptions.push(`$${value}`)
    ))

  }

  select(value, close) {
    close && this.props.onSelected && this.props.onSelected(value);
    this.setState({
      selected: value,
      visible: !close
    });
  }

  showAndroidPicker(){
    AndroidPicker.init({
           pickerData: this.androidOptions,
           selectedValue: this.state.selected,
           pickerConfirmBtnText: 'Select',
           pickerCancelBtnText: 'Cancel',
           pickerTitleText: '',
           pickerConfirmBtnColor: [102, 199, 92, 1],
           pickerCancelBtnColor: [102, 199, 92, 1],
           pickerToolBarBg: [255, 255, 255, 1],
           pickerBg: [255, 255, 255, 1],
           onPickerConfirm: value => {
               this.setState({
                 selected: [Math.round(value.toString().substr(1))],
                 visibleAndroid: false
               });
               this.props.onSelected && this.props.onSelected(value);
           },
           onPickerCancel: () => this.setState({visibleAndroid:false})
       });
    AndroidPicker.show();
  }

  render() {
    return(
      <View >
        <Modal
          transparent
          visible={this.state.visible}
          onRequestClose={() => this.setState({visible:false})}
          animationType='fade'>
          <TouchableOpacity
            onPress={() => this.select(
              this.state.selected || this.options[0],
              true
            )}
            style={styles.modal}>
            <TouchableWithoutFeedback>
              <Animatable.View
                animation='slideInUp'
                duration={150}
                style={styles.pickerContainer}>
                <Picker
                  selectedValue={this.state.selected}
                  onValueChange={value => this.select(value)}
                  style={styles.picker}>
                  {
                    this.options.map(value => (
                      <Picker.Item
                        key={Math.random()}
                        label={`$${value}`}
                        value={value} />
                    ))
                  }
                </Picker>
              </Animatable.View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
        <Modal
          transparent
          visible={this.state.visibleAndroid}
          onRequestClose={() => {
            this.setState({visibleAndroid:false});
            AndroidPicker.hide();
          }}
          onShow={() => this.showAndroidPicker()}
          animationType='fade'>
          <View style={styles.modal}/>
        </Modal>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'ios'){
              this.setState({
                visible: true
              })
            } else {
              this.setState({
                visibleAndroid: true
              })
            }}}>
          <View
            style={[
              styles.pickerButton,
              {
                backgroundColor: (
                  this.props.highlighted
                  ? Colors.Primary: Colors.Disabled
                )
              }
            ]}>
            {
              this.state.selected
              ? (
                <Text style={styles.text}>
                  {`$${this.state.selected}`}
                </Text>
              ): (
                <Icon
                  color={Colors.Text}
                  name='more-horiz'
                  size={24} />
              )
            }
          </View>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    fontSize: Sizes.Text,
    color: Colors.Text
  },

  pickerButton: {
    padding: 5,
    borderRadius: 21,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },

  modal: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: Colors.DarkOverlay
  },

  pickerContainer: {
    alignSelf: 'stretch',
    minHeight: 150,
    backgroundColor: Colors.ModalBackground
  }
});
