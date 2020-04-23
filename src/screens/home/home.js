import React from 'react';
import {View, FlatList, Image, Text} from 'react-native';
import Styles from './styles';

export default class Home extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      songs: [],
    };
  }
  componentDidMount() {
    console.log('Lets fetch data herer ');
    if (this.state.songs.length == 0) {
      this.fetchSongs();
    }
  }

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
            this.setState({songs: responseJson.feed.results});
          }
          console.log('response of fetch is ', responseJson);
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
      <View>
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
      </View>
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
