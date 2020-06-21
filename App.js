import React, { Component } from 'react'
import { Text, View, StatusBar, PermissionsAndroid, UIManager, Platform, YellowBox, Alert, BackHandler, Linking } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from 'react-navigation'
import { Provider } from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Store from './app/store'
let storeInstance = Store()
import Color from './app/components/Color'
import KomaScreen from './app/screen/credit/Koma'
import { version } from './package.json'
import cancellablePromise from './app/helpers/cancellablePromise'
import { HOST_REST_API } from './app/components/Define'

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?', 'Possible Unhandled Promise Rejection'
])

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

// Scr Main
import SearchPlacesScreen from './app/screen/SearchPlaces'
import MapSelectingScreen from './app/screen/MapSelecting'
import SoonScreen from './app/screen/Soon'
import LoginScreen from './app/screen/Login'
import RegisterScreen from './app/screen/Register'
import ForgotScreen from './app/screen/ForgotPassword'
import BookingScreen from './app/screen/Booking'
import ChatScreen from './app/screen/Chat'
import OrderDetailsScreen from './app/screen/OrderDetails'

// Scr Food
import FoodScreen from './app/screen/food/Home'
import MerchantScreen from './app/screen/food/Merchant'
import OrderScreen from './app/screen/food/Order'
import ListMenuScreen from './app/screen/food/ListMenu'
import ListMerchantScreen from './app/screen/food/ListMerchant'
import SearchMenuScreen from './app/screen/food/SearchMenu'

// Scr Ride
import RideScreen from './app/screen/ride/Home'
import OverviewScreen from './app/screen/ride/Overview'

// Tab
import MainTab from './app/screen/Main'
import AccountTab from './app/screen/Account'
import HistoryTab from './app/screen/History'
import InboxTab from './app/screen/Inbox'
const TabNavigator = createBottomTabNavigator(
  {
    Home: MainTab,
    History: HistoryTab,
    Account: AccountTab,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state
        let iconName = ``
        let label = ``
        if (routeName === 'Home') {
          iconName = `home`
          label = `Beranda`
        } else if (routeName === 'Account') {
          iconName = `user-alt`
          label = `Akun`
        } else if (routeName === 'History') {
          iconName = `receipt`
          label = `Pesanan`
        } else if (routeName === 'Inbox') {
          iconName = `envelope`
          label = `Kotak Masuk`
        }
        return (
          <View style={{ alignItems: 'center' }}>
            <Icon name={iconName} size={20} color={tintColor} />
            <Text style={{ fontSize: 11, color: focused ? Color.black : Color.textMuted, marginTop: 3, letterSpacing: 1 }} numberOfLines={1}>{label}</Text>
          </View>
        )
      }
    }),
    tabBarOptions: {
      showLabel: false,
      activeTintColor: Color.primary,
      inactiveTintColor: Color.grayDark,
      style: {
        borderTopWidth: 0,
        elevation: 10,
      }
    }
  }
)

const MainScreen = createAppContainer(TabNavigator)

const StackNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen
  },
  Register: {
    screen: RegisterScreen
  },
  Forgot: {
    screen: ForgotScreen
  },
  Main: {
    screen: MainScreen
  },
  Ride: {
    screen: RideScreen
  },
  SearchMenu: {
    screen: SearchMenuScreen
  },
  Overview: {
    screen: OverviewScreen
  },
  Food: {
    screen: FoodScreen
  },
  Merchant: {
    screen: MerchantScreen
  },
  Order: {
    screen: OrderScreen
  },
  Booking: {
    screen: BookingScreen
  },
  Chat: {
    screen: ChatScreen
  },
  OrderDetails: {
    screen: OrderDetailsScreen
  },
  ListMenu: {
    screen: ListMenuScreen
  },
  ListMerchant: {
    screen: ListMerchantScreen
  },
  Koma: {
    screen: KomaScreen
  },
  MapSelecting: {
    screen: MapSelectingScreen
  },
  SearchPlaces: {
    screen: SearchPlacesScreen
  },
  Soon: {
    screen: SoonScreen
  }
}, {
  defaultNavigationOptions: {
    header: null
  }
})

const AppContainer = createAppContainer(StackNavigator)

function changeFontStyle(a, b) {
  let oldRender = a.render;
  a.render = function (...args) {
    let origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [b, origin.props.style]
    });
  };
}

class App extends Component {
  timerReFetch
  constructor(props) {
    super(props)
    changeFontStyle(Text, { color: Color.textColor, fontFamily: 'Yantramanav' })
  }

  _requestLocationPermission = async () => {
    let permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Location Permission',
        'message': 'This App needs access to your location ' +
          'so we can know where you are.'
      }
    )

    if (permission !== 'granted') {
      this._requestLocationPermission()
    }
  }

  pendingPromises = []

  appendPendingPromise = promise => {
    this.pendingPromises = [...this.pendingPromises, promise]
  }

  removePendingPromise = promise => {
    this.pendingPromises = this.pendingPromises.filter(p => p !== promise)
  }

  componentDidMount() {
    // this._requestLocationPermission()
    StatusBar.setBarStyle('dark-content', true)
    Platform.OS === 'android' &&
      StatusBar.setBackgroundColor(Color.white, true)
    this._getAllVersion()
  }

  _getAllVersion = () => {
    const wrappedPromise = cancellablePromise(this._promiseGetAllVersion())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        clearTimeout(this.timerReFetch)
        let index = res.map(item => {
          return item.appVersionName
        }).indexOf(version)
        if (index < 0) {
          Alert.alert(
            'Aplikasi tidak bisa digunakan',
            'Mohon untuk mengupdate aplikasi ke versi terbaru',
            [
              {
                text: 'Keluar',
                onPress: () => {
                  BackHandler.exitApp()
                }
              },
              {
                text: 'Perbarui',
                onPress: () => {
                  BackHandler.exitApp()
                  Linking.openURL('market://details?id=com.koma.copek')
                }
              }
            ]
          )
        }
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch(() => {
        this.timerReFetch = setTimeout(function () {
          this._getAllVersion()
        }.bind(this), 10000)
      })
  }

  _promiseGetAllVersion = () => {
    return new Promise((resolve, reject) => {
      fetch(`${HOST_REST_API}app-version/copek`)
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar translucent />
        <Provider store={storeInstance}>
          <AppContainer />
        </Provider>
      </View>
    )
  }
}

export default App
