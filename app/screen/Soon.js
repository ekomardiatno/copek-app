import React, { Component } from 'react'
import { View, Text, Image } from 'react-native'
import { SimpleHeader } from '../components/Components'
import Color, { coloYiq } from '../components/Color'
import { AdMobInterstitial, PublisherBanner } from 'react-native-admob'

class Soon extends Component {
  componentDidMount() {
    AdMobInterstitial.setAdUnitID('ca-app-pub-8047867116429118/6848645771')
    AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <SimpleHeader goBack navigation={this.props.navigation} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>Belum tersedia</Text>
          <Text style={{ textAlign: 'center', lineHeight: 18, color: Color.textMuted }}>Maaf ya, fiturnya belum tersedia.</Text>
        </View>
        <PublisherBanner
          adSize="fullBanner"
          adUnitID="ca-app-pub-8047867116429118/7062955117"
        />
      </View>
    )
  }
}

export default Soon