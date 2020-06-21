import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableNativeFeedback } from 'react-native'
import { SimpleHeader, Card, OrderHistoryItem } from '../components/Components'
import Color, { colorYiq } from '../components/Color'
import Icon from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-community/async-storage'
import dateFormatted from '../helpers/dateFormatted'
import Currency from '../helpers/Currency'
import Animated from 'react-native-reanimated'
// import { AdMobInterstitial } from 'react-native-admob'

export default class History extends Component {
  didFocusListener
  constructor(props) {
    super(props)
    this.state = {
      orders: [],
      scrollY: new Animated.Value(0)
    }
  }

  componentDidMount() {
    // AdMobInterstitial.setAdUnitID('ca-app-pub-8047867116429118/6848645771')
    // AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId])
    // AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
    this._getData()
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this._getData()
      }
    )
  }

  _getData = () => {
    AsyncStorage.getItem('orders', function (err, orders) {
      if (orders != null) {
        orders = JSON.parse(orders)
        orders.reverse()
        this.setState({
          orders
        })
      }
    }.bind(this))
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
  }

  render() {
    const { orders } = this.state
    let estimatedPrice = 0
    const elevationHeader = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 50],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
    return (
      <View style={{ flex: 1 }}>
        <Animated.View style={{ elevation: elevationHeader, backgroundColor: Color.white }}>
          <SimpleHeader
            navigation={this.props.navigation}
            title='Pesanan'
          // rightComponent={
          //   <View style={{ justifyContent: 'center' }}>
          //     <TouchableNativeFeedback
          //       useForeground={true}
          //       background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
          //     >
          //       <View style={{ height: 30, width: 30, borderRadius: 30 / 2, marginLeft: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          //         <Icon size={18} name="search" />
          //       </View>
          //     </TouchableNativeFeedback>
          //   </View>
          // }
          />
        </Animated.View>
        {
          orders.length <= 0 ?
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Pesan COPEK, kuy!</Text>
              <Text style={{ textAlign: 'center' }}>Driver kami akan dengan senang hati membantumu.</Text>
            </View>
            :
            <Animated.ScrollView
              bounces={false}
              scrollEventThrottle={16}
              onScroll={Animated.event([
                {
                  nativeEvent: { contentOffset: { y: this.state.scrollY } }
                }
              ])}>
              {
                orders.map((order, i) => (
                  order.orderType === 'FOOD' ?
                    <OrderHistoryItem last={i === orders.length - 1 ? true : false} onPress={() => this.props.navigation.navigate('Booking', {
                      dataOrder: order
                    })} key={order.orderId} origin={order.origin} destination={order.destination} dateTime={dateFormatted(order.date, true)} type={order.orderType} fare={Currency(order.carts.map(function (a) {
                      return a.foodPrice * a.qty
                    }).reduce(function (a, b) {
                      return a + b
                    }) + order.fare)} status={order.status} />
                    :
                    <OrderHistoryItem last={i === orders.length - 1 ? true : false} onPress={() => this.props.navigation.navigate('Booking', {
                      dataOrder: order
                    })} key={order.orderId} origin={order.origin} destination={order.destination} dateTime={dateFormatted(order.date, true)} type={order.orderType} fare={Currency(order.fare)} status={order.status} />
                ))
              }
            </Animated.ScrollView>
        }
      </View>
    )
  }
}