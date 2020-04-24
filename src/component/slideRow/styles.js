import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  seperator: {
    height: 0.5,
    width: '100%',
    backgroundColor: 'rgb(211,211,211)',
  },
  songCard: {
    height: 70,
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  indexText: {
    flex: 0.2,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  songImage: {
    width: 70,
    height: 70,
  },
  songInfoView: {
    flex: 0.8,
    paddingLeft: 10,
    justifyContent: 'space-around',
  },
  songName: {
    maxWidth: '92%',
    fontSize: 18,
    fontWeight: '600',
  },
  songArtist: {
    maxWidth: '92%',
    fontSize: 16,
    fontWeight: '100',
  },
  songGenere: {
    maxWidth: '92%',
    fontSize: 14,
    fontWeight: '300',
  },
});

export default styles;
