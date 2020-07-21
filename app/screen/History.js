import React, { Component } from 'react'
import { View, Text, ScrollView, TouchableNativeFeedback, Alert } from 'react-native'
import { SimpleHeader, Card, OrderHistoryItem, Button } from '../components/Components'
import Color, { colorYiq } from '../components/Color'
import Icon from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-community/async-storage'
import dateFormatted from '../helpers/dateFormatted'
import Currency from '../helpers/Currency'
import Animated from 'react-native-reanimated'
import { AdMobInterstitial } from 'react-native-admob'
import cancellablePromise from '../helpers/cancellablePromise'
import { HOST_REST_API } from '../components/Define'

export default class History extends Component {
  didFocusListener
  constructor(props) {
    super(props)
    this.state = {
      orders: [],
      scrollY: new Animated.Value(0),
      errorFetch: false
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
    this._getCheckOrderStatus()
    this.didFocusListener = this.props.navigation.addListener(
      'didFocus',
      () => {
        this._getCheckOrderStatus()
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

  _getCheckOrderStatus = () => {
    this.setState({
      errorFetch: false
    })
    const wrappedPromise = cancellablePromise(this._promiseCheckOrderStatus())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        AdMobInterstitial.setAdUnitID('ca-app-pub-8047867116429118/6848645771')
        AdMobInterstitial.setTestDevices([AdMobInterstitial.simulatorId])
        AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd())
        if (res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            AsyncStorage.getItem('orders', (err, order) => {
              if (order !== null) {
                order = JSON.parse(order)
                let index = order.map(item => {
                  return item.orderId
                }).indexOf(res[i].orderId.toString())
                if (res[i].status !== null) {
                  order[index].status = res[i].status
                } else {
                  order.splice(index, 1)
                }
                AsyncStorage.setItem('orders', JSON.stringify(order), err => {
                  if (i + 1 >= res.length) {
                    this._getData()
                  }
                })
              }
            })
          }
        } else {
          this._getData()
        }
      })
      .then(() => this.removePendingPromise(wrappedPromise))
      .catch(err => {
        this.setState({
          alert: false
        })
      })
  }

  _promiseCheckOrderStatus = () => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('orders', (error, result) => {
        if (!error && result !== null) {
          result = JSON.parse(result)
          let filtered = result.filter(a => {
            return a.status !== 'completed' && a.status !== 'cancelled_by_user' && a.status !== 'cancelled_by_driver'
          })
          if (filtered.length > 0) {
            filtered = filtered.map(a => {
              return a.orderId
            })
            fetch(`${HOST_REST_API}order/checking`, {
              method: 'post',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(filtered)
            })
              .then(res => res.json())
              .then(resolve)
              .catch(reject)
          } else {
            resolve([])
          }
        } else {
          resolve([])
        }
      })
    })
  }

  componentWillUnmount() {
    this.didFocusListener.remove()
    this.pendingPromises.map(p => {
      this.removePendingPromise(p)
    })
  }

  render() {
    const { orders, errorFetch } = this.state
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
            errorFetch === true ?
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>Gagal mendapatkan daftar pesanan</Text>
                <Text style={{ textAlign: 'center', lineHeight: 18, color: Color.textMuted }}>Silakan cek koneksi wifi atau paket selular Anda</Text>
                <View style={{ flexDirection: 'row', marginHorizontal: -5, marginTop: 15 }}>
                  <Button style={{ marginHorizontal: 5 }} onPress={this._getCheckOrderStatus} red title='Coba lagi' />
                </View>
              </View>
              :
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