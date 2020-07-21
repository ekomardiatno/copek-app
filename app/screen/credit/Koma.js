import React, { Component } from 'react'
import { View, Text, StatusBar, ScrollView, Image, TouchableNativeFeedback, Linking, TouchableHighlight, Platform } from 'react-native'
import { SimpleHeader, Card } from '../../components/Components'
import Color from '../../components/Color'
import Animated from 'react-native-reanimated'
import Fa from 'react-native-vector-icons/FontAwesome5'

export default class Koma extends Component {

  constructor() {
    super()
    this.state = {
      scrollY: new Animated.Value(0)
    }
  }

  componentDidMount() {
    Platform.OS === 'android' &&
      StatusBar.setBackgroundColor(Color.white, true)
    StatusBar.setBarStyle('dark-content', true)
  }

  componentWillUnmount() {
    if (this.props.navigation.getParam('statusbar')) {
      StatusBar.setBarStyle(this.props.navigation.getParam('statusbar').barStyle, true)
      Platform.OS === 'android' &&
        StatusBar.setBackgroundColor(this.props.navigation.getParam('statusbar').background, true)
    }
  }

  _navigate = (screen) => {
    this.props.navigation.navigate(screen, {
      statusbar: {
        barStyle: 'dark-content',
        background: Color.white
      }
    })
  }

  render() {
    const elevationHeader = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 50],
      outputRange: [0, 5]
    })
    return (
      <View style={{ flex: 1, backgroundColor: Color.grayLighter }}>
        <Animated.View style={{ elevation: elevationHeader, backgroundColor: Color.white }}>
          <SimpleHeader goBack navigation={this.props.navigation} title='Pengembang aplikasi' />
        </Animated.View>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            {
              nativeEvent: { contentOffset: { y: this.state.scrollY } }
            }
          ])}
        >
          <View style={{ backgroundColor: Color.white, padding: 15, borderBottomColor: Color.borderColor, borderBottomWidth: 1 }}>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ height: 80, width: 80, borderRadius: 40, padding: 5, backgroundColor: Color.primary }}>
                <View style={{ width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden' }}>
                  <Image style={{ width: '100%', height: '100%' }} source={require('../../images/koma.jpg')} />
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <Text style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 }}><Text style={{ color: Color.primary }}>Eko</Text>Mardiatno</Text>
              <Text style={{ fontSize: 12, color: Color.textMuted }}>Web & Mobile Developer | Designer</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: -5 }}>
              {
                Platform.OS === 'android' ?
                  <TouchableNativeFeedback
                    onPress={() => Linking.openURL('https://instagram.com/komafx')}
                    useForeground={true}
                    background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='instagram' />
                    </View>
                  </TouchableNativeFeedback>
                  :
                  <TouchableHighlight
                    onPress={() => Linking.openURL('https://instagram.com/komafx')}
                    activeOpacity={0.85}
                    underlayColor='#fff'
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='instagram' />
                    </View>
                  </TouchableHighlight>
              }
              {
                Platform.OS === 'android' ?
                  <TouchableNativeFeedback
                    onPress={() => Linking.openURL('https://twitter.com/ekomardiatno')}
                    useForeground={true}
                    background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='twitter' />
                    </View>
                  </TouchableNativeFeedback>
                  :
                  <TouchableHighlight
                    onPress={() => Linking.openURL('https://twitter.com/ekomardiatno')}
                    activeOpacity={0.85}
                    underlayColor='#fff'
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='twitter' />
                    </View>
                  </TouchableHighlight>
              }
              {
                Platform.OS === 'android' ?
                  <TouchableNativeFeedback
                    onPress={() => Linking.openURL('https://facebook.com/emrdtn')}
                    useForeground={true}
                    background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='facebook' />
                    </View>
                  </TouchableNativeFeedback>
                  :
                  <TouchableHighlight
                    onPress={() => Linking.openURL('https://facebook.com/emrdtn')}
                    activeOpacity={0.85}
                    underlayColor='#fff'
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='facebook' />
                    </View>
                  </TouchableHighlight>
              }
              {
                Platform.OS === 'android' ?
                  <TouchableNativeFeedback
                    onPress={() => Linking.openURL('whatsapp://send?phone=+6282219299071')}
                    useForeground={true}
                    background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='whatsapp' />
                    </View>
                  </TouchableNativeFeedback>
                  :
                  <TouchableHighlight
                    onPress={() => Linking.openURL('whatsapp://send?phone=+6282219299071')}
                    activeOpacity={0.85}
                    underlayColor='#fff'
                  >
                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Color.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginHorizontal: 5 }}>
                      <Fa color={Color.primary} size={18} name='whatsapp' />
                    </View>
                  </TouchableHighlight>
              }
            </View>
          </View>
          <Card
            headerStyleGray
            headerTitle='Biodata'
            body={
              <View style={{ paddingHorizontal: 15, paddingBottom: 9 }}>
                <View style={{ flexDirection: 'row', marginBottom: 6, marginHorizontal: -3, alignItems: 'flex-start' }}>
                  <Text style={{ flex: 1, fontSize: 12, marginHorizontal: 3 }}>Tanggal Lahir</Text>
                  <Text style={{ flex: 1, textAlign: 'right', fontSize: 12, marginHorizontal: 3 }}>16 Januari 1995</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 6, marginHorizontal: -3, alignItems: 'flex-start' }}>
                  <Text style={{ flex: 1, fontSize: 12, marginHorizontal: 3 }}>Agama</Text>
                  <Text style={{ flex: 1, textAlign: 'right', fontSize: 12, marginHorizontal: 3 }}>Islam</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 6, marginHorizontal: -3, alignItems: 'flex-start' }}>
                  <Text style={{ flex: 1, fontSize: 12, marginHorizontal: 3 }}>Jenis Kelamin</Text>
                  <Text style={{ flex: 1, textAlign: 'right', fontSize: 12, marginHorizontal: 3 }}>Laki-laki</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 6, marginHorizontal: -3, alignItems: 'flex-start' }}>
                  <Text style={{ flex: 1, fontSize: 12, marginHorizontal: 3 }}>Email</Text>
                  <Text style={{ flex: 1, textAlign: 'right', fontSize: 12, marginHorizontal: 3 }}>ekomardiatno@gmail.com</Text>
                </View>
              </View>
            }
          />
        </Animated.ScrollView>
      </View>
    )
  }
}