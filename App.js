/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react'
import {
  View
} from 'react-native'
import HomeScreen from './Home'
import HelloScreen from './Hello'
import { createAppContainer, createStackNavigator } from 'react-navigation'

const StackNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen
  },
  Hello: {
    screen: HelloScreen
  }
})

const AppContainer = createAppContainer(StackNavigator)

class App extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <AppContainer/>
      </View>
    )
  }
}

export default App