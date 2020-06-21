import React, { Component } from 'react'
import { View, Text, StatusBar, TouchableNativeFeedback, Image, Alert, BackHandler, ToastAndroid, ScrollView, Platform, TouchableHighlight, SafeAreaView } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'
import Fa from 'react-native-vector-icons/FontAwesome5'
import Color from '../../components/Color'
import { Input, Button, Card, SimpleHeader, DummyReviewFoodOrder, PopUp, DashLine } from '../../components/Components'
import { getCurrentPosition, getDistanceMatrix } from '../../actions/locations.actions'
import { getGeocoding, getAddressComponents } from '../../actions/geocode.actions'
import { getCart, addToCart, removeFromCart, editCart } from '../../actions/carts.actions'
import { getFare } from '../../actions/fare.actions'
import Currency from '../../helpers/Currency'
import cancellablePromise from '../../helpers/cancellablePromise'
import Animated from 'react-native-reanimated'
import { HOST_REST_API } from '../../components/Define'
import AsyncStorage from '@react-native-community/async-storage'
import getImageThumb from '../../helpers/getImageThumb'
import DistanceFormat from '../../helpers/DistanceFormat'
import { AdMobBanner } from 'react-native-admob'

export default class Order extends Component {

  constructor() {
    super()
    this.state = {
      carts: [],
      distances: null,
      origin: null,
      destination: null,
      merchant: null,
      position: null,
      fare: 0,
      popUpCatatan: false,
      popUpOpened: false,
      idCatatanAktif: null,
      formCatatan: '',
      note: '',
      scrollY: new Animated.Value(0),
      isPossible: true
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
    Platform.OS === 'android' &&
      StatusBar.setBackgroundColor('transparent', true)
    StatusBar.setBarStyle('dark-content', true)
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
    if (this.props.navigation.getParam('data')) {
      this.setState({
        position: this.props.navigation.getParam('data').position ? this.props.navigation.getParam('data').position : null,
      }, () => {
        this.state.position !== null ?
          this._getGeocoding()
          :
          this._getLocation()
      })
    }
    if (this.props.navigation.getParam('backHandler')) {
      this.props.navigation.getParam('backHandler').remove()
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress)
    if (this.props.navigation.getParam('statusbar')) {
      StatusBar.setBarStyle(this.props.navigation.getParam('statusbar').barStyle, true)
      Platform.OS === 'android' &&
        StatusBar.setBackgroundColor(this.props.navigation.getParam('statusbar').background, true)
    }
    if (this.props.navigation.getParam('actionBack')) {
      this.props.navigation.getParam('actionBack')()
    }
    if (this.props.navigation.getParam('backHandler')) {
      this.props.navigation.getParam('backHandler').add()
    }
    this.pendingPromises.map(p => {
      this.removePendingPromise(p)
    })
  }

  _handleBackPress = () => {
    if (this.state.popUpOpened) {
      this.setState({
        popUpOpened: false
      })
      return true
    } else {
      return false
    }
  }

  _getLocation = () => {
    const wrappedPromise = cancellablePromise(getCurrentPosition())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(position => {
        this.setState({
          position
        }, () => {
          this._getGeocoding()
        })
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch(error => {
        Alert.alert(
          'Gagal mendapatkan lokasi terkini',
          'Cek koneksi wifi atau jaringan seluler anda dan coba lagi',
          [
            {
              text: 'Coba lagi',
              onPress: this._getLocation
            },
            {
              text: 'Kembali',
              onPress: () => {
                this.props.navigation.goBack()
              }
            }
          ],
          { cancelable: false }
        )
      })
  }

  _getGeocoding = () => {
    const { position } = this.state
    const wrappedPromise = cancellablePromise(getGeocoding(position))
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(geocode => {
        geocode = getAddressComponents(geocode)
        this.setState({
          destination: {
            geometry: {
              latitude: position.latitude,
              longitude: position.longitude
            },
            geocode: {
              title: geocode[0],
              address: geocode[1]
            }
          }
        }, () => {
          this._getCart()
        })
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch(error => {
        Alert.alert(
          'Gagal mendapatkan info lokasi',
          'Cek koneksi wifi atau jaringan seluler anda dan coba lagi',
          [
            {
              text: 'Coba lagi',
              onPress: this._getGeocoding
            },
            {
              text: 'Kembali',
              onPress: () => {
                this.props.navigation.goBack()
              }
            }
          ],
          { cancelable: false }
        )
      })
  }

  _getDistances = () => {
    const { origin, destination } = this.state
    const wrappedPromise = cancellablePromise(getDistanceMatrix(origin, destination.geometry))
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(async (distances) => {
        this.setState({
          distances: {
            distance: distances.rows[0].elements[0].distance.value,
            duration: distances.rows[0].elements[0].duration.value
          },
          fare: await getFare(distances.rows[0].elements[0].distance.value, 'food')
        }, () => {
          if (this.state.distances.distance > 25000) {
            this.setState({
              isPossible: false
            }, () => {
              ToastAndroid.show('Resto terlalu jauh', ToastAndroid.LONG)
            })
          }
        })
      })
      .then(() => {
        this.appendPendingPromise(wrappedPromise)
      })
      .catch(error => {
        Alert.alert(
          'Gagal menghitung jarak',
          'Cek koneksi wifi atau jaringan seluler anda dan coba lagi',
          [
            {
              text: 'Coba lagi',
              onPress: this._getDistances
            },
            {
              text: 'Kembali',
              onPress: () => {
                this.props.navigation.goBack()
              }
            }
          ],
          { cancelable: false }
        )
      })
  }

  _getMerchant = () => {
    const { carts } = this.state
    const merchantId = carts[0].merchantId
    const wrappedPromise = cancellablePromise(this._promiseMerchant(merchantId))
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(merchant => {
        if (merchant && merchant.merchantOcs === 'opened') {

          merchant.merchantLatitude = parseFloat(merchant.merchantLatitude)
          merchant.merchantLongitude = parseFloat(merchant.merchantLongitude)
          this.setState({
            merchant: merchant,
            origin: {
              latitude: merchant.merchantLatitude,
              longitude: merchant.merchantLongitude,
            }
          }, () => {
            this._getDistances()
          })
        } else {
          Alert.alert(
            'Toko sedang tutup',
            'Ingin menghapus pesanan saat ini?',
            [
              {
                text: 'OK, Hapus',
                onPress: () => {
                  AsyncStorage.removeItem('cart', () => {
                    this.props.navigation.goBack()
                  })
                }
              },
              {
                text: 'Nanti',
                onPress: () => {
                  this.props.navigation.goBack()
                }
              }
            ]
          )
        }
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch(error => {
        Alert.alert(
          'Gagal mendapatkan info resto',
          'Cek koneksi wifi atau jaringan seluler anda dan coba lagi',
          [
            {
              text: 'Coba lagi',
              onPress: this._getMerchant
            },
            {
              text: 'Kembali',
              onPress: () => {
                this.props.navigation.goBack()
              }
            }
          ],
          { cancelable: false }
        )
      })
  }

  _getCart = () => {
    getCart()
      .then(carts => {
        this.setState({
          carts
        }, () => {
          this._getMerchant()
        })
      })
  }

  _promiseMerchant = (merchantId) => {
    return new Promise((resolve, reject) => {
      fetch(`${HOST_REST_API}merchant/${merchantId}`)
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _navigate = (screen, params = {}) => {
    this.props.navigation.navigate(screen, {
      ...params,
      statusbar: {
        barStyle: 'dark-content',
        background: 'transparent'
      },
      backHandler: {
        add: () => BackHandler.addEventListener('hardwareBackPress', this._handleBackPress),
        remove: () => BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress)
      }
    })
  }

  _selectLocation = (location) => {
    this.setState({
      destination: {
        geometry: {
          latitude: location.geometry.latitude,
          longitude: location.geometry.longitude
        },
        geocode: {
          title: location.geocode.title,
          address: location.geocode.address
        }
      },
      distances: null
    }, () => {
      this._getDistances()
    })
  }

  _removeCart = (id) => {
    removeFromCart(id)
      .then(items => {
        this.setState({
          carts: items
        }, () => {
          this.state.carts.length <= 0 && this.props.navigation.goBack()
        })
      })
  }

  _addCart = (data) => {
    addToCart(data, this.state.merchant)
      .then(items => {
        this.setState({
          carts: items
        })
      })
  }

  _closePopUpCatatan = () => {
    this.setState({
      popUpOpened: false,
      popUpCatatan: false
    })
  }

  _openPopUpCatatan = (foodId) => {
    let data = this.state.carts.filter(e => { return e.foodId == foodId })
    this.setState({
      popUpCatatan: true,
      popUpOpened: true,
      idCatatanAktif: foodId,
      formCatatan: data[0].note
    })
  }

  _editCatatan = () => {
    let { idCatatanAktif, formCatatan } = this.state
    let catatan = {
      note: formCatatan
    }
    editCart(idCatatanAktif, catatan)
      .then(carts => {
        this.setState({
          carts: carts,
          formCatatan: ''
        })
      })
  }

  _onLayout = event => {
    let height = event.nativeEvent.layout.height
    this.viewRef.setNativeProps({
      paddingTop: height
    })
  }

  _booking = () => {
    AsyncStorage.getItem('orders', function (err, orders) {
      let length = 0, array = []
      if (orders !== null) {
        orders = JSON.parse(orders)
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].status !== 'completed' && orders[i].status !== 'cancelled_by_user' && orders[i].status !== 'cancelled_by_driver') {
            array.push(orders[i])
          }
        }
        length = array.length
      }
      if (length > 0) {
        ToastAndroid.show('Anda memiliki pesanan yang belum selesai', ToastAndroid.SHORT)
      } else {
        // ToastAndroid.show('Semua pesanan sudah selesai', ToastAndroid.SHORT)
        this.props.navigation.navigate('Booking', {
          orderType: 'FOOD',
          merchant: this.state.merchant,
          carts: this.state.carts,
          fare: this.state.fare,
          destination: this.state.destination,
          distances: this.state.distances,
          note: this.state.note
        })
      }
    }.bind(this))
  }

  render() {
    const elevation = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 50],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
    return (
      <View style={{ flex: 1, backgroundColor: Color.white, position: 'relative' }}>
        {
          this.state.popUpCatatan ?
            <PopUp
              style={{ zIndex: 10 }}
              opened={this.state.popUpOpened}
              content={
                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Tambahkan catatan untuk pesanan</Text>
                  <Input
                    maxLength={200} onChangeText={text => {
                      this.setState({ formCatatan: text })
                    }}
                    style={{ paddingHorizontal: 10, marginBottom: 15 }} value={this.state.formCatatan} placeholder='Contoh: Extra pedas!' multiline={true} styleTextInput={{ height: 100, textAlignVertical: 'top', paddingVertical: 10 }} />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: Color.textMuted }}>{this.state.formCatatan.length} / 200</Text>
                    </View>
                    <View>
                      <Button onPress={() => {
                        this._editCatatan()
                        this._closePopUpCatatan()
                      }} small green title='Selesai' />
                    </View>
                  </View>
                </View>
              }
              close={this._closePopUpCatatan}
            />
            : null
        }
        <View>
          <Animated.View style={{ elevation: this.state.popUpOpened ? 0 : elevation, backgroundColor: Color.white }}>
            <SimpleHeader goBack navigation={this.props.navigation} title={this.state.distances != null ? this.state.merchant.merchantName : ''}
              mainComponent={
                this.state.distances != null
                  ? null
                  :
                  <View style={{ height: 40, justifyContent: 'center' }}>
                    <View style={{ width: 80, height: 16, marginBottom: 4, marginTop: 1, backgroundColor: Color.grayLighter, borderRadius: 4 }}></View>
                  </View>
              }
            />
          </Animated.View>
        </View>
        {
          this.state.distances != null
            ?

            <Animated.ScrollView
              scrollEventThrottle={16}
              onScroll={Animated.event([
                {
                  nativeEvent: { contentOffset: { y: this.state.scrollY } }
                }
              ])}
            >
              <View style={{ paddingBottom: 10 }}>
                <View style={{ backgroundColor: Color.white }}>
                  <View style={{ padding: 15 }}>
                    <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'center' }}>
                      <View>
                        <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 45 / 2, backgroundColor: Color.secondary }}>
                          <Fa color={Color.white} size={16} name="map-marker-alt" />
                        </View>
                      </View>
                      <View style={{ paddingHorizontal: 10, flex: 1 }}>
                        <Text style={{ fontSize: 12 }}>Alamat pengiriman</Text>
                        <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{this.state.destination.geocode.title}</Text>
                      </View>
                      <View>
                        {
                          Platform.OS === 'android' ?
                            <TouchableNativeFeedback
                              onPress={() => {
                                this._navigate('MapSelecting', {
                                  selectedLocation: this.state.destination.geometry,
                                  selectLocation: this._selectLocation
                                })
                              }}
                              useForeground={true}
                              background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15', false)}
                            >
                              <View style={{ width: 30, height: 30, borderRadius: 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                                <Fa name="ellipsis-v" />
                              </View>
                            </TouchableNativeFeedback>
                            :
                            <TouchableHighlight
                              onPress={() => {
                                this._navigate('MapSelecting', {
                                  selectedLocation: this.state.destination.geometry,
                                  selectLocation: this._selectLocation
                                })
                              }}
                              activeOpacity={0.85}
                              underlayColor='#fff'
                              style={{ borderRadius: 15 }}
                            >
                              <View style={{ width: 30, height: 30, borderRadius: 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                                <Fa name="ellipsis-v" />
                              </View>
                            </TouchableHighlight>
                        }
                      </View>
                    </View>
                    <View>
                      <Input
                        maxLength={200}
                        onChangeText={text => {
                          this.setState({ note: text })
                        }}
                        value={this.state.note}
                        feather
                        icon="clipboard"
                        placeholder="Tambahkan catatan alamat pengiriman"
                      />
                    </View>
                  </View>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: Color.grayLighter }}>
                  <View style={{ width: 320, height: 50, marginVertical: 15, backgroundColor: Color.grayLight }}>
                    <AdMobBanner
                      adSize="banner"
                      adUnitID="ca-app-pub-8047867116429118/7062955117"
                    // testDevices={[AdMobBanner.simulatorId]}
                    // onAdFailedToLoad={error => console.error(error)}
                    />
                  </View>
                </View>
                <Card
                  style={{ borderTopWidth: 0, borderBottomWidth: 0 }}
                  headerStyleGray
                  headerDashLine
                  headerTitle='Pesanan'
                  btnTitle='Tambah'
                  btnAction={() => {
                    this.props.navigation.getParam('isFromMerchantPage') ?
                      this.props.navigation.goBack()
                      :
                      this._navigate('Merchant', {
                        data: {
                          merchantId: this.state.merchant.merchantId
                        },
                        isFromOrderPage: true,
                        actionNext: () => this._getCart()
                      })
                  }}
                  body={
                    <View>
                      {
                        this.state.carts.map(item =>
                          <View key={item.foodId} style={{ paddingHorizontal: 15, paddingVertical: 15 }}>
                            <View style={{ flexDirection: 'row', position: 'relative' }}>
                              <View style={{ width: 70, height: 70 }}>
                                <Image style={{ width: '100%', height: '100%', borderRadius: 3 }} resizeMode='cover' source={{ uri: getImageThumb(item.foodPicture, 'sm') }} />
                              </View>
                              {
                                item.foodDiscount > 0 &&
                                <View style={{ position: 'absolute', top: 5, left: -4.5, width: 55, height: 24 }}>
                                  <Image style={{ width: '100%', height: '100%' }} resizeMode='contain' source={require('../../images/ribbon.png')} />
                                </View>
                              }
                              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 6 }} numberOfLines={2}>{item.foodName}</Text>
                                <View style={{ flexDirection: 'row', marginHorizontal: -5, marginBottom: 6 }}>
                                  <Text style={{ fontWeight: 'bold', marginHorizontal: 5 }}>{Currency(item.foodPrice)}</Text>
                                  {
                                    item.foodDiscount > 0 &&
                                    <Text style={{ fontWeight: 'bold', marginHorizontal: 5, textDecorationLine: 'line-through', textDecorationStyle: 'solid', color: Color.textMuted }}>{Currency(item.foodRealPrice)}</Text>
                                  }
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                  <View style={{ marginHorizontal: -5, flexDirection: 'row' }}>
                                    {
                                      Platform.OS === 'android' ?
                                        <TouchableNativeFeedback
                                          useForeground={true}
                                          background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                                          onPress={() => {
                                            this._openPopUpCatatan(item.foodId)
                                          }}
                                        >
                                          <View style={{ marginHorizontal: 5, height: 30, borderRadius: 3, overflow: 'hidden', elevation: 1, width: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.white }}>
                                            {
                                              item.note != ''
                                                ?
                                                <Feather style={{ color: Color.green, fontSize: 11 }} name='check-circle' />
                                                :
                                                <Feather style={{ color: Color.secondary, fontSize: 11 }} name='edit-3' />
                                            }
                                          </View>
                                        </TouchableNativeFeedback>
                                        :
                                        <TouchableHighlight
                                          style={{ borderRadius: 3 }}
                                          activeOpacity={0.85}
                                          underlayColor='#fff'
                                          onPress={() => {
                                            this._openPopUpCatatan(item.foodId)
                                          }}
                                        >
                                          <View style={{ marginHorizontal: 5, height: 30, borderRadius: 3, overflow: 'hidden', elevation: 1, width: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.white }}>
                                            {
                                              item.note != ''
                                                ?
                                                <Feather style={{ color: Color.green, fontSize: 11 }} name='check-circle' />
                                                :
                                                <Feather style={{ color: Color.secondary, fontSize: 11 }} name='edit-3' />
                                            }
                                          </View>
                                        </TouchableHighlight>
                                    }
                                    <View style={{ marginHorizontal: 5, height: 30, flexDirection: 'row', borderRadius: 3, overflow: 'hidden', elevation: 1 }}>
                                      {
                                        Platform.OS === 'android' ?
                                          <TouchableNativeFeedback
                                            useForeground={true}
                                            background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                                            onPress={() => {
                                              this._removeCart(item.foodId)
                                            }}
                                          >
                                            <View style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}>
                                              <Feather style={{ color: Color.secondary, fontSize: 11 }} name='minus' />
                                            </View>
                                          </TouchableNativeFeedback>
                                          :
                                          <TouchableHighlight
                                            activeOpacity={0.85}
                                            underlayColor='#fff'
                                            onPress={() => {
                                              this._removeCart(item.foodId)
                                            }}
                                            style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}
                                          >
                                            <View>
                                              <Feather style={{ color: Color.secondary, fontSize: 11 }} name='minus' />
                                            </View>
                                          </TouchableHighlight>
                                      }
                                      <View style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ lineHeight: 14, fontSize: 11, fontWeight: 'bold' }}>{item.qty}</Text>
                                      </View>
                                      {
                                        Platform.OS === 'android' ?
                                          <TouchableNativeFeedback
                                            useForeground={true}
                                            background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                                            onPress={() => {
                                              this._addCart(item)
                                            }}
                                          >
                                            <View style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}>
                                              <Feather style={{ color: Color.secondary, fontSize: 11 }} name='plus' />
                                            </View>
                                          </TouchableNativeFeedback>
                                          :
                                          <TouchableHighlight
                                            activeOpacity={0.85}
                                            underlayColor='#fff'
                                            onPress={() => {
                                              this._addCart(item)
                                            }}
                                            style={{ width: 30, alignItems: 'center', justifyContent: 'center' }}
                                          >
                                            <View>
                                              <Feather style={{ color: Color.secondary, fontSize: 11 }} name='plus' />
                                            </View>
                                          </TouchableHighlight>
                                      }
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        )
                      }
                      {
                        this.state.carts.length <= 0
                          ?
                          <View style={{ paddingHorizontal: 30, paddingVertical: 30 }}>
                            <Text style={{ color: Color.textMuted, textAlign: 'center' }}>Belum ada pesanan.</Text>
                          </View>
                          : null
                      }
                    </View>
                  }
                />

                <Card
                  style={{ borderTopWidth: 0, borderBottomWidth: 0 }}
                  headerStyleGray
                  headerDashLine
                  headerTitle='Detail pembayaran'
                  body={
                    <View>
                      <View style={{ paddingVertical: 15, paddingBottom: 9 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                          <Text style={{ flex: 1 }}>Total Harga</Text>
                          <Text style={{ flex: 1, textAlign: 'right' }}>{
                            Currency(
                              this.state.carts.reduce((a, b) => {
                                return a + b.qty * b.foodRealPrice
                              }, 0)
                            )
                          }</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                          <Text style={{ flex: 1 }}>Potongan</Text>
                          <Text style={{ flex: 1, textAlign: 'right' }}>{
                            this.state.carts.reduce((a, b) => {
                              return a + b.qty * b.foodDiscount
                            }, 0) > 0 ? '-' +
                              Currency(
                                this.state.carts.reduce((a, b) => {
                                  return a + b.qty * b.foodDiscount
                                }, 0)
                              )
                              :
                              Currency(
                                this.state.carts.reduce((a, b) => {
                                  return a + b.qty * b.foodDiscount
                                }, 0)
                              )
                          }</Text>
                        </View>
                        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                          <Text style={{ flex: 1 }}>Ongkos Kirim ({DistanceFormat(this.state.distances.distance)})</Text>
                          <Text style={{ flex: 1, textAlign: 'right' }}>{Currency(this.state.fare)}</Text>
                        </View>
                      </View>
                      <DashLine />
                      <View style={{ paddingVertical: 15 }}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ flex: 1, fontWeight: 'bold' }}>Total pembayaran</Text>
                          <Text style={{ flex: 1, fontWeight: 'bold', textAlign: 'right' }}>{
                            Currency(
                              this.state.carts.reduce((a, b) => {
                                return a + b.qty * b.foodPrice
                              }, 0) + this.state.fare
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  }
                  bodyStyle={{ paddingHorizontal: 15 }}
                />
              </View>
            </Animated.ScrollView>
            :
            <DummyReviewFoodOrder />
        }
        <View style={{ padding: 15, backgroundColor: Color.white, borderTopColor: Color.borderColor, borderTopWidth: 1 }}>
          <SafeAreaView>
            {
              this.state.distances != null && this.state.carts.length > 0 && this.state.isPossible
                ?
                <Button
                  onPress={this._booking}
                  title='Pesan sekarang'
                />
                :
                <View
                  style={{
                    elevation: 0,
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    borderRadius: 3,
                    borderWidth: 0,
                    borderColor: Color.grayLighter,
                    backgroundColor: Color.grayLighter,
                    overflow: 'hidden'
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center'
                    }}
                  >
                    {
                      this.state.distances != null &&
                      `Pesan sekarang`
                    }
                  </Text>
                </View>
            }
          </SafeAreaView>
        </View>
      </View>
    )
  }
}