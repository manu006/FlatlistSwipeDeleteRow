import React from 'react';
import {View, Image, Text, PanResponder, Animated} from 'react-native';

import Styles from './styles';

export default class SlideRow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      marginLeft: 0,
    };
    this._handlePanResponderMove = this._handlePanResponderMove.bind(this);
    this._handlePanResponderEnd = this._handlePanResponderEnd.bind(this);
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onStartShouldSetPanResponderCapture: (event, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (event, gestureState) =>
        Math.abs(gestureState.dx) > 50 && Math.abs(gestureState.dy) <= 50,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
      onShouldBlockNativeResponder: (event, gestureState) => false,
      onPanResponderTerminationRequest: () => false,
    });
  }

  _handlePanResponderGrant(e, gestureState) {
    console.log('  **********  ', {e, gestureState});
  }

  _handlePanResponderMove(e, gestureState) {
    let posX = gestureState.dx;
    let posY = gestureState.dy;
    if (this.state.marginLeft + posX < 0) {
      this.setState({marginLeft: posX});
    } else {
      this.setState({marginLeft: 0});
    }
  }

  _handlePanResponderEnd(e, gestureState) {
    let {item} = this.props;
    if (this.state.marginLeft < -100) {
      this.props.removeCell(item.index);
    } else {
      this.setState({marginLeft: 0});
    }
  }

  renderSeperator = () => {
    return <View style={Styles.seperator} />;
  };

  render() {
    let {item, generies} = this.props;
    return (
      <Animated.View
        style={{
          marginLeft: this.state.marginLeft,
        }}
        {...this._panResponder.panHandlers}
        // style={{transform: [{scale}]}}
      >
        <View style={Styles.songCard}>
          <Text style={Styles.indexText}>{item.index + 1}</Text>
          <Image
            source={{uri: item.item.artworkUrl100}}
            style={Styles.songImage}
          />
          <View style={Styles.songInfoView}>
            <Text style={Styles.songName} numberOfLines={1}>
              {item.item.name}
            </Text>
            <Text style={Styles.songArtist} numberOfLines={1}>
              {item.item.artistName}
            </Text>
            <Text style={Styles.songGenere} numberOfLines={1}>
              {generies}
            </Text>
          </View>
        </View>
        {this.renderSeperator()}
      </Animated.View>
    );
  }
}
