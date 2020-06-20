/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  View,
  ScrollView
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import { AdMobBanner } from 'react-native-admob'

class App extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ height: 400, backgroundColor: '#f5f5f5', marginBottom: 15 }}>
            <MapView
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={{flex: 1}}
              region={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
            </MapView>
          </View>
          <View style={{ alignItems: 'center'}}>
            <View style={{ backgroundColor: '#f5f5f5', width: 300, height: 250 }}>
              <AdMobBanner
                adSize="mediumRectangle"
                adUnitID="ca-app-pub-8047867116429118/7062955117"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default App