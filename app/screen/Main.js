import React,{ Component } from 'react'
import { View,StatusBar,Dimensions,Alert,BackHandler,AppState,Platform,ActivityIndicator,ToastAndroid,TouchableHighlight, Text } from 'react-native'
import Color,{ colorYiq } from '../components/Color'
import { MainMenu,DummyMainMenu } from '../components/Components'
const { width,height } = Dimensions.get('window')
import Animated from 'react-native-reanimated'
import { HOST_REST_API } from '../components/Define'
import cancellablePromise from '../helpers/cancellablePromise'
import AsyncStorage from '@react-native-community/async-storage'
import { AdMobBanner } from 'react-native-admob'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import { setCurrentPosition } from '../actions/locations.actions'
import GPSState from 'react-native-gps-state'
import Icon from 'react-native-vector-icons/Ionicons'

export default class Main extends Component {
  timer
  constructor(props) {
    super(props)
    this.state = {
      scrollY: new Animated.Value(0),
      hasConnection: true,
      ready: false,
      isLocationReady: false,
      isGeolocationActive: false,
      gpsState: false,
      statusConnection: '',
      user: null
    }

    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      startForeground: false,
      notificationsEnabled: false,
      notificationTitle: 'Pelacak lokasi',
      notificationText: 'Diaktifkan',
      debug: false,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    })
  }

  pendingPromises = []

  appendPendingPromise = promise => {
    this.pendingPromises = [...this.pendingPromises,promise]
  }

  removePendingPromise = promise => {
    this.pendingPromises = this.pendingPromises.filter(p => p !== promise)
  }

  componentDidMount() {
    // AsyncStorage.removeItem('currentLocation')
    Platform.OS === 'android' &&
      StatusBar.setBackgroundColor('transparent',true)
    StatusBar.setBarStyle('dark-content',true)
    AppState.addEventListener('change',this._handleAppState)
    this._fetchGetUser()
    GPSState.getStatus()
      .then(status => {
        if (status === 3 || status === 4) {
          this.setState({
            gpsState: true
          },() => {
            this._activateGeolocation()
          })
        } else if (status === 2) {
          if (Platform.OS === 'android') {
            GPSState.requestAuthorization(GPSState.AUTHORIZED)
          } else {
            Alert.alert(
              'Location Services',
              'App requieres location services'
            )
          }
        } else if (status === 1) {
          if (Platform.OS === 'android') {
            Alert.alert(
              'Layanan lokasi',
              'Aplikasi membutuhkan layanan lokasi dengan akurasi tinggi',
              [
                {
                  text: 'Aktifkan',
                  onPress: () => {
                    BackHandler.exitApp()
                    GPSState.openLocationSettings()
                  }
                }
              ]
            )
          } else {
            Alert.alert(
              'Location Services',
              'App requieres location services'
            )
          }
        } else {
          GPSState.requestAuthorization(GPSState.AUTHORIZED)
        }
      })

      GPSState.addListener((status) => {
        switch (status) {
          case GPSState.DENIED:
            Alert.alert(
              'Layanan lokasi',
              'Aplikasi membutuhkan layanan lokasi dengan akurasi tinggi',
              [
                {
                  text: 'Keluar',
                  onPress: () => {
                    BackHandler.exitApp()
                  }
                }
              ]
            )
            break
          case GPSState.AUTHORIZED:
            this.setState({
              gpsState: true
            },() => {
              this._activateGeolocation()
            })
            break
          case GPSState.AUTHORIZED_WHENINUSE:
            this.setState({
              gpsState: true
            },() => {
              this._activateGeolocation()
            })
            break
        }
      })

    BackgroundGeolocation.on('location',this._onLocation)
  }

  _fetchGetUser = () => {
    this.setState({
      statusConnection: 'FETCHING'
    })
    const wrappedPromise = cancellablePromise(this._promiseGetUser())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(user => {
        if (user !== null) {
          this.setState({
            user: user
          },() => {
            this._getFareSettings()
          })
        } else {
          AsyncStorage.removeItem('user_logged_in',(error) => {
            if (!error) {
              AsyncStorage.removeItem('orders')
              this.props.navigation.replace('Login')
            }
          })
        }
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch(err => {
        this.setState({
          statusConnection: 'ERROR'
        })
      })
  }

  _promiseGetUser = () => {
    return new Promise((resolve,reject) => {
      AsyncStorage.getItem(
        'user_logged_in',
        (error,result) => {
          if (!error) {
            if (result !== null) {
              const user = JSON.parse(result)
              fetch(`${HOST_REST_API}user/${user.userPhone}`)
                .then(res => res.json())
                .then(resolve)
                .catch(reject)
            }
          }
        }
      )
    })
  }

  _activateGeolocation = () => {
    !this.state.isGeolocationActive && this.state.gpsState &&
      this.setState({
        isGeolocationActive: true
      },() => {
        BackgroundGeolocation.start()
        if (!this.state.isLocationReady) {
          this.timer = setTimeout(() => {
            this.setState({
              isGeolocationActive: false,
            })
            BackgroundGeolocation.stop()
            Alert.alert(
              'Akurasi lokasi lemah',
              'Maaf kami tidak dapat menemukan lokasi yang akurat melalui perangkat Anda',
              [
                {
                  text: 'Coba lagi',
                  onPress: this._activateGeolocation
                }
              ]
            )
          },30000)
        }
      })
  }

  _deactivateGeolocation = () => {
    this.state.isGeolocationActive &&
      this.setState({
        isGeolocationActive: false
      },() => {
        clearTimeout(this.timer)
        BackgroundGeolocation.stop()
      })
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeAllListeners()
    GPSState.removeListener()
    AppState.removeEventListener('change',this._handleAppState)
    this.pendingPromises.map(p => {
      this.removePendingPromise(p)
    })
    clearTimeout(this.timer)
  }

  _handleAppState = (nextAppState) => {
    if (nextAppState === 'active') {
      this._activateGeolocation()
    } else {
      this._deactivateGeolocation()
    }
  }

  _onLocation = position => {
    const wrappedPromise = cancellablePromise(setCurrentPosition(position))
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        clearTimeout(this.timer)
        this.setState({
          isLocationReady: true
        })
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
  }

  _navigate = (screen,data) => {
    this.props.navigation.navigate(screen,{
      statusbar: {
        barStyle: 'dark-content',
        background: 'transparent'
      },
      data: data
    })
  }

  _getFareSettings = () => {
    this.setState({
      statusConnection: 'FETCHING'
    })
    const wrappedPromise = cancellablePromise(this._promiseFareSettings())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        AsyncStorage.setItem('fare',JSON.stringify(res),() => {
          this.setState({
            ready: true
          })
        })
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch((e) => {
        this.setState({
          statusConnection: 'ERROR'
        })
      })
  }

  _promiseFareSettings = () => {
    return new Promise((resolve,reject) => {
      fetch(`${HOST_REST_API}fare`)
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  render() {
    const marginContainer = Animated.interpolate(this.state.scrollY,{
      inputRange: [0,60],
      outputRange: [15,0],
      extrapolate: 'clamp'
    })
    const borderRadiusContainer = Animated.interpolate(this.state.scrollY,{
      inputRange: [0,60],
      outputRange: [20,0],
      extrapolate: 'clamp'
    })
    const opacityStatusBar = Animated.interpolate(this.state.scrollY,{
      inputRange: [0,60],
      outputRange: [.5,1],
      extrapolate: 'clamp'
    })
    const heightBanner = Animated.interpolate(this.state.scrollY,{
      inputRange: [0,(3 / 4 * width) - 150 + StatusBar.currentHeight],
      outputRange: [3 / 4 * width,150 + StatusBar.currentHeight],
      extrapolate: 'clamp'
    })
    const sizeLogoBanner = Animated.interpolate(this.state.scrollY,{
      inputRange: [0,(3 / 4 * width) - 150 + StatusBar.currentHeight],
      outputRange: [150,75],
      extrapolate: 'clamp'
    })
    const opacityLogo = Animated.interpolate(this.state.scrollY,{
      inputRange: [0,((3 / 4 * width) - 150 + StatusBar.currentHeight) / 2 - 25,(3 / 4 * width) - 150 + StatusBar.currentHeight],
      outputRange: [1,1,0],
      extrapolate: 'clamp'
    })
    return (
      <View style={{ flex: 1,backgroundColor: Color.white,position: 'relative' }}>
        <Animated.View style={{ position: 'absolute',top: 0,left: 0,right: 0,height: StatusBar.currentHeight,backgroundColor: Color.white,opacity: opacityStatusBar,zIndex: 2 }} />
        <Animated.View style={{ paddingHorizontal: 15,alignItems: 'center',overflow: 'hidden',position: 'absolute',zIndex: 0,top: 0,left: 0,right: 0,zIndex: 1,backgroundColor: Color.white }}>
          <Animated.Image style={{ width: width,height: heightBanner }} resizeMode='cover' source={require('../images/food-background.png')} />
          <Animated.Image style={{ width: sizeLogoBanner,height: sizeLogoBanner,position: 'absolute',top: '50%',marginTop: -75,opacity: opacityLogo }} resizeMode='contain' source={require('../images/copek.png')} />
        </Animated.View>
        <View style={{ position: 'relative',flex: 1,zIndex: 1 }}>
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
            <View style={{ marginTop: 3 / 4 * width,minHeight: height - (3 / 4 * width) - 50 }}>
              <Animated.View style={{ marginTop: -30,flex: 1,borderTopLeftRadius: borderRadiusContainer,borderTopRightRadius: borderRadiusContainer,paddingVertical: 15,paddingHorizontal: 0,backgroundColor: Color.white,marginHorizontal: marginContainer,elevation: 20 }}>
                {
                  this.state.statusConnection === 'ERROR' &&
                  <View style={{ flexDirection: 'row',alignItems: 'center',paddingHorizontal: 10,paddingVertical: 10,marginHorizontal: 15,backgroundColor: Color.red,borderRadius: 4, marginTop: 5 }}>
                    <View style={{ flex: 1, marginHorizontal: 5 }}>
                      <Text style={{ color: colorYiq(Color.red),fontSize: 13 }}>Tidak dapat terhubung ke sistem</Text>
                    </View>
                    <TouchableHighlight
                      underlayColor={Color.black}
                      onPress={() => {
                        if (this.state.user === null) {
                          this._fetchGetUser()
                        } else {
                          this._getFareSettings()
                        }
                      }}
                      style={{ marginHorizontal: 5,borderRadius: 30 / 2 }}
                    >
                      <View style={{ width: 30,height: 30,borderRadius: 30 / 2,backgroundColor: colorYiq(Color.red),alignItems: 'center',justifyContent: 'center' }}>
                        <Icon color={Color.red} name='md-refresh' size={18} />
                      </View>
                    </TouchableHighlight>
                  </View>
                }
                <View style={{ flexDirection: 'row',justifyContent: 'center',flexWrap: 'wrap',marginBottom: 15 }}>
                  <MainMenu onPress={() => {
                    this.state.ready && this.state.isLocationReady ?
                      this._navigate('Ride')
                      :
                      ToastAndroid.show('Aplikasi belum terhubung ke sistem',ToastAndroid.SHORT)
                  }} fa='motorcycle' color={this.state.ready && this.state.isLocationReady ? Color.blue : Color.grayLight} title='Ride' />
                  <MainMenu onPress={() => {
                    this.state.ready && this.state.isLocationReady ?
                      this._navigate('Food')
                      :
                      ToastAndroid.show('Aplikasi belum terhubung ke sistem',ToastAndroid.SHORT)
                  }} fa='utensils' color={this.state.ready && this.state.isLocationReady ? Color.primary : Color.grayLight} title='Food' />
                  <MainMenu onPress={() => this._navigate('Soon')} color={Color.red} fa='car' title='Rent' />
                  <MainMenu onPress={() => this._navigate('Soon')} color={Color.cean} fa='bus' title='Travel' />
                  <MainMenu onPress={() => this._navigate('Soon')} color={Color.purple} fa='box' title='Send' />
                  <MainMenu onPress={() => this._navigate('Soon')} color={Color.teal} fa='mobile-alt' title='Pulsa' />
                </View>
                <View style={{ alignItems: 'center',marginBottom: 15 }}>
                  <View style={{ backgroundColor: Color.grayLighter,width: 300,height: 250 }}>
                    <View style={{ position: 'absolute',top: 0,left: 0,right: 0,bottom: 0,alignItems: 'center',justifyContent: 'center' }}>
                      <ActivityIndicator size='large' color={Color.gray} />
                    </View>
                    <AdMobBanner
                      adSize="mediumRectangle"
                      adUnitID="ca-app-pub-8047867116429118/7062955117"
                    />
                  </View>
                </View>
              </Animated.View>
            </View>
          </Animated.ScrollView>
        </View>
      </View>
    )
  }
}