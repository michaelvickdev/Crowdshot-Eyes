import React, {
  Component
} from 'react';
import {
  View, StyleSheet, Text, TextInput, Platform, StatusBar
} from 'react-native';
import {
  Colors, Sizes
} from '../../Const';
import {
  Actions
} from 'react-native-router-flux';

// components
import TitleBar from '../../components/common/TitleBar';
import CloseFullscreenButton from '../../components/common/CloseFullscreenButton';
import Field from '../../components/common/Field';
import Button from '../../components/common/Button';

export default class TextEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      height: 20
    };
  }

  componentDidMount() {
    Platform.OS !== 'ios'
      && StatusBar.setBackgroundColor(Colors.Background, false);
  }

  render() {
    return (
      <View style={styles.container}>
        <TitleBar title={this.props.title} />
        <View style={styles.content}>
          <Field
            isBottom
            label={this.props.label || 'Message'}
            subtitle={this.props.subtitle}
            style={styles.field}>
            <TextInput
              multiline
              autoFocus
              underlineColorAndroid={Colors.Transparent}
              value={this.state.value}
              placeholderTextColor={Colors.SubduedText}
              onContentSizeChange={e => this.setState({
                height: e.nativeEvent.contentSize.height
              })}
              onChangeText={text => this.setState({
                value: text
              })}
              style={[
                styles.input,
                {
                  height: this.state.height
                }
              ]} />
          </Field>
        </View>
        {
          this.props.disclaimer && (
            <View style={styles.disclaimerContainer}>
              <Text style={styles.disclaimer}>
                {this.props.disclaimer}
              </Text>
            </View>
          )
        }
        <Button
          onPress={() => {
            Actions.pop();
            this.props.onSubmit && this.props.onSubmit(this.state.value);
          }}
          color={Colors.Primary}
          label={this.props.buttonLabel || 'Submit'} />
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
    alignItems: 'center',
    backgroundColor: Colors.ModalBackground
  },

  content: {
    alignSelf: 'stretch'
  },

  field: {
    alignSelf: 'stretch'
  },

  input: {
    flex: 1,
    top: -Sizes.InnerFrame / 2.5,
    marginLeft: Sizes.InnerFrame,
    color: Colors.Text,
    fontSize: Sizes.Text
  },

  disclaimerContainer: {
    padding: Sizes.InnerFrame,
    paddingTop: 0,
    paddingLeft: Sizes.OuterFrame,
    paddingRight: Sizes.OuterFrame
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: Sizes.SmallText,
    color: Colors.AlternateText
  }
});
