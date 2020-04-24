import React from 'react';
import {View, FlatList, Text} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import {SlideRow} from '../../component';
import Styles from './styles';

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      songs: [],
    };
    this.removeCell = this.removeCell.bind(this);
  }

  componentDidMount() {
    if (this.state.songs.length == 0) {
      this.getAsyncSongs();
    }
  }

  getAsyncSongs = async () => {
    try {
      const value = await AsyncStorage.getItem('@Itune_Songs');
      if (value !== null) {
        let songs = JSON.parse(value);
        this.setState({songs});
        // value previously stored
      } else {
        this.fetchSongs();
      }
    } catch (e) {
      console.log('Catch error while reading data is', e);
      // error reading value
    }
  };

  removeCell(index) {
    let {songs} = this.state;
    songs.splice(index, 1);
    let newSongs = [].concat(songs);
    this.setState({songs: newSongs}, () => {
      this.storeData(newSongs);
    });
  }

  storeData = async songs => {
    try {
      let songsString = JSON.stringify(songs);
      await AsyncStorage.setItem('@Itune_Songs', songsString);
    } catch (e) {
      console.log('Catch error while storing data is', e);
      // saving error
    }
  };

  fetchSongs() {
    try {
      fetch(
        'https://rss.itunes.apple.com/api/v1/us/apple-music/coming-soon/all/100/explicit.json',
      )
        .then(async res => {
          let responseJson = await res.json();
          if (
            res &&
            responseJson &&
            responseJson.feed &&
            responseJson.feed.results &&
            responseJson.feed.results.length > 0
          ) {
            this.storeData(responseJson.feed.results);
            this.setState({songs: responseJson.feed.results});
          }
        })
        .catch(err => {
          console.log('Error while fetching data is ', err);
        });
    } catch (error) {
      console.log('Error of try catch is as follows ', error);
    }
  }

  renderSeperator = () => {
    return <View style={Styles.seperator} />;
  };

  renderItem = item => {
    let generies = '';
    item.item.genres.map((item, index) => {
      if (index == 0) {
        generies += item.name;
      } else {
        generies = generies + ', ' + item.name;
      }
    });
    return (
      <SlideRow item={item} generies={generies} removeCell={this.removeCell} />
    );
  };

  render() {
    return (
      <View style={Styles.container}>
        <Text style={Styles.header}>Apple upcomming songs</Text>
        {this.renderSeperator()}
        <FlatList
          contentContainerStyle={{paddingBottom: 30}}
          data={this.state.songs}
          extraData={this.state.songs}
          renderItem={item => this.renderItem(item)}
          style={Styles.songList}
        />
      </View>
    );
  }
}
