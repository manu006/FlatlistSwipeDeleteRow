import tweenState from 'react-tween-state';
import SwipeView from './swipeView';
import styles from './styles';

import React from 'react';

import {
  PanResponder,
  View,
} from 'react-native';

class SwipeoutBtn extends React.PureComponent {
  getDefaultProps() {
    return {
      backgroundColor: null,
      color: null,
      component: null,
      underlayColor: null,
      height: 0,
      onPress: null,
      disabled: false,
      text: 'Click me',
      type: '',
      width: 0,
    };
  }

  render() {
    let btn = this.props;
    let styleSwipeoutBtn = [styles.swipeoutBtn];

    if (btn.type === 'delete') styleSwipeoutBtn.push(styles.colorDelete);
    else if (btn.type === 'primary') styleSwipeoutBtn.push(styles.colorPrimary);
    else if (btn.type === 'secondary')
      styleSwipeoutBtn.push(styles.colorSecondary);

    if (btn.backgroundColor)
      styleSwipeoutBtn.push([{backgroundColor: btn.backgroundColor}]);

    styleSwipeoutBtn.push([
      {
        height: btn.height,
        width: btn.width,
      },
    ]);

    let styleSwipeoutBtnComponent = [];

    styleSwipeoutBtnComponent.push([
      {
        height: btn.height,
        width: btn.width,
      },
    ]);

    let styleSwipeoutBtnText = [styles.swipeoutBtnText];

    if (btn.color) styleSwipeoutBtnText.push({color: btn.color});

    return (
      <SwipeView
        onPress={this.props.onPress}
        underlayColor={this.props.underlayColor}
        disabled={this.props.disabled}
        style={[styles.swipeoutBtnTouchable, styleSwipeoutBtn]}
        textStyle={styleSwipeoutBtnText}>
        {btn.component ? (
          <View style={styleSwipeoutBtnComponent}>{btn.component}</View>
        ) : (
          btn.text
        )}
      </SwipeView>
    );
  }
}

class Swipeout extends React.PureComponent{

  getDefaultProps() {
    return {
      disabled: false,
      rowID: -1,
      sectionID: -1,
      sensitivity: 50,
    };
  }

  getInitialState() {
    return {
      autoClose: this.props.autoClose || false,
      btnWidth: 0,
      btnsLeftWidth: 0,
      btnsRightWidth: 0,
      contentHeight: 0,
      contentPos: 0,
      contentWidth: 0,
      openedRight: false,
      swiping: false,
      tweenDuration: 160,
      timeStart: null,
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onStartShouldSetPanResponderCapture: (event, gestureState) =>
        this.state.openedLeft || this.state.openedRight,
      onMoveShouldSetPanResponderCapture: (event, gestureState) =>
        Math.abs(gestureState.dx) > this.props.sensitivity &&
        Math.abs(gestureState.dy) <= this.props.sensitivity,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
      onPanResponderTerminate: this._handlePanResponderEnd,
      onShouldBlockNativeResponder: (event, gestureState) => false,
      onPanResponderTerminationRequest: () => false,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.close) this._close();
    if (nextProps.openRight) this._openRight();
    if (nextProps.openLeft) this._openLeft();
  }

  _handlePanResponderGrant(e, gestureState) {
    if (this.props.disabled) return;
    if (!this.state.openedLeft && !this.state.openedRight) {
      this._callOnOpen();
    } else {
      this._callOnClose();
    }
    this.swipeoutContent.measure((ox, oy, width, height) => {
      let buttonWidth = this.props.buttonWidth || width / 5;
      this.setState({
        btnWidth: buttonWidth,
        btnsLeftWidth: this.props.left
          ? buttonWidth * this.props.left.length
          : 0,
        btnsRightWidth: this.props.right
          ? buttonWidth * this.props.right.length
          : 0,
        swiping: true,
        timeStart: new Date().getTime(),
      });
    });
  }

  _handlePanResponderMove(e, gestureState) {
    if (this.props.disabled) return;
    let posX = gestureState.dx;
    let posY = gestureState.dy;
    let leftWidth = this.state.btnsLeftWidth;
    let rightWidth = this.state.btnsRightWidth;
    if (this.state.openedRight) let posX = gestureState.dx - rightWidth;
    else if (this.state.openedLeft) let posX = gestureState.dx + leftWidth;

    let moveX = Math.abs(posX) > Math.abs(posY);
    if (this.props.scroll) {
      if (moveX) this.props.scroll(false);
      else this.props.scroll(true);
    }
    if (this.state.swiping) {
      if (posX < 0 && this.props.right) {
        this.setState({contentPos: Math.min(posX, 0)});
      } else if (posX > 0 && this.props.left) {
        this.setState({contentPos: Math.max(posX, 0)});
      }
    }
  }

  _handlePanResponderEnd(e, gestureState) {
    if (this.props.disabled) return;
    let posX = gestureState.dx;
    let contentPos = this.state.contentPos;
    let contentWidth = this.state.contentWidth;
    let btnsLeftWidth = this.state.btnsLeftWidth;
    let btnsRightWidth = this.state.btnsRightWidth;

    let openX = contentWidth * 0.33;

    let openLeft = posX > openX || posX > btnsLeftWidth / 2;
    let openRight = posX < -openX || posX < -btnsRightWidth / 2;

    if (this.state.openedRight) let openRight = posX - openX < -openX;
    if (this.state.openedLeft) let openLeft = posX + openX > openX;

    let timeDiff = new Date().getTime() - this.state.timeStart < 200;
    if (timeDiff) {
        openRight = posX < -openX / 10 && !this.state.openedLeft;
        openLeft = posX > openX / 10 && !this.state.openedRight;
    }

    if (this.state.swiping) {
      if (openRight && contentPos < 0 && posX < 0) {
        this._open(-btnsRightWidth, 'right');
      } else if (openLeft && contentPos > 0 && posX > 0) {
        this._open(btnsLeftWidth, 'left');
      } else {
        this._close();
      }
    }

    if (this.props.scroll) this.props.scroll(true);
  }

  _tweenContent(state, endValue) {
    this.tweenState(state, {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration:
        endValue === 0
          ? this.state.tweenDuration * 1.5
          : this.state.tweenDuration,
      endValue: endValue,
    });
  }

  _rubberBandEasing(value, limit) {
    if (value < 0 && value < limit)
      return limit - Math.pow(limit - value, 0.85);
    else if (value > 0 && value > limit)
      return limit + Math.pow(value - limit, 0.85);
    return value;
  }

  _autoClose(btn) {
    if (this.state.autoClose) this._close();
    let onPress = btn.onPress;
    if (onPress) onPress();
  }

  _open(contentPos, direction) {
    const left = direction === 'left';
    const {sectionID, rowID, onOpen} = this.props;
    onOpen && onOpen(sectionID, rowID, direction);
    this._tweenContent('contentPos', contentPos);
    this.setState({
      contentPos,
      openedLeft: left,
      openedRight: !left,
      swiping: false,
    });
  }

  _close() {
    const {sectionID, rowID, onClose} = this.props;
    if (onClose && (this.state.openedLeft || this.state.openedRight)) {
      const direction = this.state.openedRight ? 'right' : 'left';
      onClose(sectionID, rowID, direction);
    }
    this._tweenContent('contentPos', 0);
    this._callOnClose();
    this.setState({
      openedRight: false,
      openedLeft: false,
      swiping: false,
    });
  }

  _callOnClose() {
    if (this.props.onClose)
      this.props.onClose(this.props.sectionID, this.props.rowID);
  }

  _callOnOpen() {
    if (this.props.onOpen)
      this.props.onOpen(this.props.sectionID, this.props.rowID);
  }

  _openRight() {
    this.swipeoutContent.measure((ox, oy, width, height) => {
      let btnWidth = this.props.buttonWidth || width / 5;

      this.setState(
        {
          btnWidth,
          btnsRightWidth: this.props.right
            ? btnWidth * this.props.right.length
            : 0,
        },
        () => {
          this._tweenContent('contentPos', -this.state.btnsRightWidth);
          this._callOnOpen();
          this.setState({
            contentPos: -this.state.btnsRightWidth,
            openedLeft: false,
            openedRight: true,
            swiping: false,
          });
        },
      );
    });
  }

  _openLeft() {
    this.swipeoutContent.measure((ox, oy, width, height) => {
      let btnWidth = this.props.buttonWidth || width / 5;

      this.setState(
        {
          btnWidth,
          btnsLeftWidth: this.props.left
            ? btnWidth * this.props.left.length
            : 0,
        },
        () => {
          this._tweenContent('contentPos', this.state.btnsLeftWidth);
          this._callOnOpen();
          this.setState({
            contentPos: this.state.btnsLeftWidth,
            openedLeft: true,
            openedRight: false,
            swiping: false,
          });
        },
      );
    });
  }

  render() {
    let contentWidth = this.state.contentWidth;
    let posX = this.getTweeningValue('contentPos');

    let styleSwipeout = [styles.swipeout, this.props.style];
    if (this.props.backgroundColor) {
      styleSwipeout.push([{backgroundColor: this.props.backgroundColor}]);
    }

    let limit = -this.state.btnsRightWidth;
    if (posX > 0) let limit = this.state.btnsLeftWidth;

    let styleLeftPos = {
      left: {
        left: 0,
        overflow: 'hidden',
        width: Math.min(limit * (posX / limit), limit),
      },
    };
    let styleRightPos = {
      right: {
        left: Math.abs(contentWidth + Math.max(limit, posX)),
        right: 0,
      },
    };
    let styleContentPos = {
      content: {
        transform: [{translateX: this._rubberBandEasing(posX, limit)}],
      },
    };

    let styleContent = [styles.swipeoutContent];
    styleContent.push(styleContentPos.content);

    let styleRight = [styles.swipeoutBtns];
    styleRight.push(styleRightPos.right);

    let styleLeft = [styles.swipeoutBtns];
    styleLeft.push(styleLeftPos.left);
    
    let isRightVisible = posX < 0;
    let isLeftVisible = posX > 0;

    return (
      <View style={styleSwipeout}>
        <View
          ref={node => (this.swipeoutContent = node)}
          style={styleContent}
          onLayout={this._onLayout}
          {...this._panResponder.panHandlers}>
          {this.props.children}
        </View>
        {this._renderButtons(this.props.right, isRightVisible, styleRight)}
        {this._renderButtons(this.props.left, isLeftVisible, styleLeft)}
      </View>
    );
  }

  _onLayout(event) {
    let {width, height} = event.nativeEvent.layout;
    this.setState({
      contentWidth: width,
      contentHeight: height,
    });
  }

  _renderButtons(buttons, isVisible, style) {
    if (buttons && isVisible) {
      return <View style={style}>{buttons.map(this._renderButton)}</View>;
    } else {
      return <View />;
    }
  }

  _renderButton(btn, i) {
    return (
      <SwipeoutBtn
        backgroundColor={btn.backgroundColor}
        color={btn.color}
        component={btn.component}
        disabled={btn.disabled}
        height={this.state.contentHeight}
        key={i}
        onPress={() => this._autoClose(btn)}
        text={btn.text}
        type={btn.type}
        underlayColor={btn.underlayColor}
        width={this.state.btnWidth}
      />
    );
  }
};

const Swipeout = {
  NativeButton: SwipeView,
  SwipeoutButton: SwipeoutBtn,
};

export default Swipeout;