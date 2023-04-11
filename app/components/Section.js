import React, { Component } from 'react'
import {
  View,
  Text,
  Linking,
  Image,
  TouchableNativeFeedback,
  StatusBar,
  Dimensions,
  TouchableHighlight,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native'
import Color, { colorYiq } from './Color'
import Feather from 'react-native-vector-icons/Feather'
import Fa from 'react-native-vector-icons/FontAwesome5'
import Currency from '../helpers/Currency'
import LinearGradient from 'react-native-linear-gradient'
import DistanceFormat from '../helpers/DistanceFormat'
import distance from '../helpers/distance'
import { FoodMerchant, DashLine } from './Components'
import Animated, { Easing } from 'react-native-reanimated'
const { width, height } = Dimensions.get('window')
import getImageThumb from '../helpers/getImageThumb'
import { AdMobBanner } from 'react-native-admob'

export class MerchantSection extends Component {
  cartRef = React.createRef()
  scrollRef = React.createRef()
  constructor(props) {
    super(props)
    this.state = {
      scrollY: new Animated.Value(0),
      wrapperCart: new Animated.Value(100),
      scrollEnd: 0,
      wrapperHeight: 0,
    }
  }

  componentDidUpdate() {
    const { carts } = this.props
    if (carts.length < 1) {
      Animated.timing(this.state.wrapperCart, {
        duration: 250,
        toValue: 100,
        easing: Easing.inOut(Easing.ease),
      }).start()
    } else {
      Animated.timing(this.state.wrapperCart, {
        duration: 250,
        toValue: 0,
        easing: Easing.inOut(Easing.ease),
      }).start()
    }
  }

  _lastestScrollY = 0
  _momentumScrollEnd = (e) => {
    const { carts } = this.props
    if (carts.length > 0) {
      Animated.timing(this.state.wrapperCart, {
        duration: 250,
        toValue: e.nativeEvent.contentOffset.y > this.state.scrollEnd ? 100 : 0,
        easing: Easing.inOut(Easing.ease),
      }).start()
    }
    this._lastestScrollY = e.nativeEvent.contentOffset.y
  }

  render() {
    const heightImg = width / 4 * 3

    const opacityMapLocation = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 50, 100],
      outputRange: [1, 1, 0]
    })

    const heightThumbnail = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 190],
      outputRange: [heightImg, (Platform.OS === 'android' ? StatusBar.currentHeight : 40) + 60],
      extrapolate: 'clamp'
    })

    const opacityHeader = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 120, 190],
      outputRange: [0, 0, 1]
    })

    const opacityHideHeader = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 120, 190],
      outputRange: [1, 1, 0]
    })

    const { merchantName } = this.props.info

    return (
      <View style={{ flex: 1 }}>
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', zIndex: 2, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40, paddingHorizontal: 15 }}>
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.35)', opacity: opacityHeader }} />
          <View style={{ paddingVertical: 10 }}>
            {
              Platform.OS === 'android' ?
                <TouchableNativeFeedback
                  onPress={() => this.props.navigation.goBack()}
                  useForeground
                  background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                >
                  <View style={{ height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <Animated.View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,.35)', opacity: opacityHideHeader }} />
                    <Text style={{ color: Color.white }}><Fa size={18} name='chevron-left' /></Text>
                  </View>
                </TouchableNativeFeedback>
                :
                <TouchableHighlight
                  underlayColor='#fff'
                  activeOpacity={0.85}
                  onPress={() => this.props.navigation.goBack()}
                  style={{ borderRadius: 20 }}
                >
                  <View style={{ height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <Animated.View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,.35)', opacity: opacityHideHeader }} />
                    <Text style={{ color: Color.white }}><Fa size={18} name='chevron-left' /></Text>
                  </View>
                </TouchableHighlight>
            }
          </View>
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 10 }}>
            <Animated.Text numberOfLines={1} style={{ fontWeight: 'bold', fontSize: 18, color: Color.white, opacity: opacityHeader }}>{merchantName}</Animated.Text>
          </View>
        </Animated.View>
        <Animated.View style={{ position: 'absolute', zIndex: 1, top: 0, left: 0, right: 0, backgroundColor: '#333', height: heightThumbnail }}>
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <Animated.View style={{ position: 'absolute', top: 0, height: Platform.OS === 'android' ? StatusBar.currentHeight : 40, left: 0, right: 0, zIndex: 1, opacity: opacityHideHeader }}>
              <LinearGradient style={{ flex: 1 }} colors={['rgba(0,0,0,.75)', 'rgba(0,0,0,.25)', 'transparent']}></LinearGradient>
            </Animated.View>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Image style={{ width: '100%', height: '100%' }} source={{ uri: getImageThumb(this.props.info.merchantPicture, 'md') }} />
            </View>
          </View>
          {
            Platform.OS === 'android' ?
              <TouchableNativeFeedback
                useForeground={true}
                background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                onPress={() => Linking.openURL(`geo:${this.props.info.merchantLatitude},${this.props.info.merchantLongitude}?q=${this.props.info.merchantLatitude},${this.props.info.merchantLongitude}`)}
              >
                <Animated.View style={{ position: 'absolute', right: 15, bottom: -15, overflow: 'hidden', borderRadius: 3, elevation: 5, opacity: opacityMapLocation }}>
                  <Image style={{ height: 60, width: 60 }} source={require('../images/map-location.jpg')} />
                </Animated.View>
              </TouchableNativeFeedback>
              :
              <TouchableHighlight
                style={{ borderRadius: 3 }}
                onPress={() => Linking.openURL(`geo:${this.props.info.merchantLatitude},${this.props.info.merchantLongitude}?q=${this.props.info.merchantLatitude},${this.props.info.merchantLongitude}`)}
                activeOpacity={0.85}
                underlayColor='#fff'
              >
                <Animated.View style={{ position: 'absolute', right: 15, bottom: -15, overflow: 'hidden', borderRadius: 3, elevation: 5, opacity: opacityMapLocation }}>
                  <Image style={{ height: 60, width: 60 }} source={require('../images/map-location.jpg')} />
                </Animated.View>
              </TouchableHighlight>
          }
        </Animated.View>
        <Animated.ScrollView
          ref={this.scrollRef}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={this._momentumScrollEnd}
          onScroll={Animated.event([
            {
              nativeEvent: { contentOffset: { y: this.state.scrollY } }
            }
          ])}
        >
          <View>
            <View style={{ backgroundColor: Color.white, borderBottomColor: Color.borderColor, borderBottomWidth: 1 }}>
              <View style={{ paddingHorizontal: 15, position: 'relative', paddingTop: heightImg }}>
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 3 }}>{this.props.info.merchantName}</Text>
                  <Text style={{ marginBottom: 15 }}>{this.props.info.merchantAddress}</Text>
                  <DashLine />
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, alignItems: 'center' }}>
                    <Fa name='map-marker-alt' size={16} color={Color.red} />
                    <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 2, paddingLeft: 5 }}>{DistanceFormat((distance(this.props.currentPosition.latitude, this.props.currentPosition.longitude, this.props.info.merchantLatitude, this.props.info.merchantLongitude, 'K') * 1000).toFixed(0))}</Text>
                  </View>
                </View>
                {/* <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center' }}>
                  <Feather name='clock' size={15} color={Color.green} />
                  <Text style={{ color: Color.green, textTransform: 'uppercase', fontSize: 12 }}> Buka</Text>
                  <Text style={{ fontSize: 12 }}>  hingga 23:59 hari ini</Text>
                </View> */}
              </View>
            </View>
            <View style={{ paddingVertical: 10, alignItems: 'center' }}>
              <View style={{ backgroundColor: Color.grayLight, width: 320, height: 50 }}>
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size='large' color={Color.gray} />
                </View>
                <AdMobBanner
                  adSize="banner"
                  adUnitID="ca-app-pub-8047867116429118/7062955117"
                // testDevices={[AdMobBanner.simulatorId]}
                // onAdFailedToLoad={error => console.error(error)}
                />
              </View>
            </View>
            <FoodMerchant data={this.props.foods} removeCartAction={this.props.removeCartAction} addCartAction={this.props.addCartAction} carts={this.props.carts} openPopUpCatatan={this.props.openPopUpCatatan} openPopUpFood={this.props.openPopUpFood} />
            {/* <View style={{ backgroundColor: Color.white, paddingBottom: 15 }}>
              <TouchableNativeFeedback
                useForeground={true}
                background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
              >
                <View style={{ paddingTop: 15, flexDirection: 'row' }}>
                  <View style={{ paddingHorizontal: 15 }}>
                    <Image style={{ width: 50, height: 50 }} source={require('../images/icons/search.png')} />
                  </View>
                  <View style={{ paddingRight: 10, flex: 1 }}>
                    <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1 }}>
                      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Gak nemu yang kamu cari?</Text>
                      <Text style={{ marginBottom: 15 }}>Coba klik disini untuk mencari.</Text>
                    </View>
                  </View>
                </View>
              </TouchableNativeFeedback>
            </View> */}
          </View>
        </Animated.ScrollView>
        <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', transform: [{ translateY: this.state.wrapperCart }] }}>
          {
            Platform.OS === 'android' ?
              <TouchableNativeFeedback
                onPress={() => {
                  this.props.isFromOrderPage ?
                    this.props.navigation.goBack()
                    :
                    this.props.navigate('Order', {
                      isFromMerchantPage: true
                    })
                }}
                useForeground={true}
                background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
              >
                <View style={{ padding: 10, borderRadius: 4, elevation: 3, backgroundColor: Color.primary, margin: 15 }}>
                  <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
                    <View style={{ flex: 1, paddingLeft: 5 }}>
                      <Text style={{ fontWeight: 'bold', color: colorYiq(Color.primary), fontSize: 12 }}>{
                        this.props.carts.length > 0 ?
                          this.props.carts.reduce((a, b) => {
                            return a + b.qty
                          }, 0)
                          : 0
                      } item | {
                          this.props.carts.length > 0 ?
                            Currency(this.props.carts.reduce((a, b) => {
                              return a + b.qty * b.foodPrice
                            }, 0))
                            :
                            Currency(0)
                        } (est)</Text>
                      <Text style={{ fontSize: 11, color: colorYiq(Color.primary) }}>{this.props.carts.length > 0 ? this.props.carts[0].merchantName : 'Tidak ada merchant'}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' }}>
                      <Feather color={colorYiq(Color.primary)} size={18} name='shopping-bag' />
                    </View>
                  </View>
                </View>
              </TouchableNativeFeedback>
              :
              <SafeAreaView>
                <TouchableHighlight
                  style={{
                    borderRadius: 4, shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    shadowOpacity: 0.22,
                    shadowRadius: 2.22,
                    margin: 15
                  }}
                  underlayColor='#fff'
                  activeOpacity={0.85}
                  onPress={() => {
                    this.props.isFromOrderPage ?
                      this.props.navigation.goBack()
                      :
                      this.props.navigate('Order', {
                        isFromMerchantPage: true
                      })
                  }}
                >
                  <View style={{ padding: 10, borderRadius: 4, elevation: 3, backgroundColor: Color.primary }}>
                    <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
                      <View style={{ flex: 1, paddingLeft: 5 }}>
                        <Text style={{ fontWeight: 'bold', color: colorYiq(Color.primary), fontSize: 12 }}>{
                          this.props.carts.length > 0 ?
                            this.props.carts.reduce((a, b) => {
                              return a + b.qty
                            }, 0)
                            : 0
                        } item | {
                            this.props.carts.length > 0 ?
                              Currency(this.props.carts.reduce((a, b) => {
                                return a + b.qty * b.foodPrice
                              }, 0))
                              :
                              Currency(0)
                          } (est)</Text>
                        <Text style={{ fontSize: 11, color: colorYiq(Color.primary) }}>{this.props.carts.length > 0 ? this.props.carts[0].merchantName : 'Tidak ada merchant'}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <Feather color={colorYiq(Color.primary)} size={18} name='shopping-bag' />
                      </View>
                    </View>
                  </View>
                </TouchableHighlight>
              </SafeAreaView>
          }
        </Animated.View>
      </View>
    )
  }
}