import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

export default class AlignItemsBasics extends Component {
  render() {
    return (
      <View
        style={styles.backgroundImage}>
        <Text style={styles.headline}>Welcome</Text>
        <Text style={styles.headline}>欢迎</Text>
        <Text style={styles.headline}>Bienvenido</Text>
        <Text style={styles.headline}>أهلا بك</Text>
        <Text style={styles.headline}>स्वागत हे</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        backgroundColor: '#ed2553',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center'
    },

    headline: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 0,
        justifyContent: 'left',
        alignItems: 'center',
    },
});

// skip this line if using Create React Native App
AppRegistry.registerComponent('AwesomeProject', () => AlignItemsBasics);
