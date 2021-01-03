import React, { Component } from 'react'
import { View, StatusBar, ScrollView, Image, Text, TouchableNativeFeedback, BackHandler, Platform , TouchableHighlight} from 'react-native'
import { SimpleHeader, Input } from '../components/Components'
import Color from '../components/Color'
import Spinner from 'react-native-spinkit'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { dataPlaces, getDataPlaces, getCurrentPosition } from '../actions/locations.actions'
import cancellablePromise from '../helpers/cancellablePromise'
import Fa from 'react-native-vector-icons/FontAwesome5'
import Animated from 'react-native-reanimated'

class SearchPlaces extends Component {
  constructor(props) {
    super(props)
    this.state = {
      search: '',
      isSearching: false,
      scrollY: new Animated.Value(0),
      region: null
    }
  }

  componentDidMount() {
    this._getLocation()
  }

  _getLocation = () => {
    const wrappedPromise = cancellablePromise(getCurrentPosition())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise.then(position => {
      this.setState({
        region: {
          latitude: position.latitude,
          longitude: position.longitude
        }
      })
    })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch((error) => {
        Alert.alert(
          'Gagal mendapatkan lokasi terkini',
          'Terjadi kesalahan pada sistem, coba lagi nanti',
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

  componentWillUnmount() {
    this.pendingPromises.map(p => {
      p.cancel()
      this.removePendingPromise(p)
    })
  }

  pendingPromises = []

  appendPendingPromise = promise => {
    this.pendingPromises = [...this.pendingPromises, promise]
  }

  removePendingPromise = promise => {
    this.pendingPromises = this.pendingPromises.filter(p => p !== promise)
  }

  _changeText = (search) => {
    this.setState({
      search
    })
  }

  _onSearch = () => {
    this.setState({
      isSearching: true
    }, () => {
      const wrappedPromise = cancellablePromise(getDataPlaces(this.state.region.latitude + ',' + this.state.region.longitude, this.state.search))
      this.appendPendingPromise(wrappedPromise)
      wrappedPromise.promise.then(places => {
        this.props.dataPlaces(places)
      })
        .then(() => {
          this.setState({
            isSearching: false
          }, () => {
            this.removePendingPromise(wrappedPromise)
          })
        })
        .catch((error) => {
          Alert.alert(
            'Gagal mendapatkan tempat',
            'Terjadi kesalahan pada sistem, coba lagi nanti',
            [
              {
                text: 'Coba lagi',
                onPress: this._onSearch
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
    })
  }

  _chooseLocation = (lat, lng, title) => {
    this.props.navigation.goBack()
    this.props.navigation.state.params.actionBySearch(lat, lng, title)
  }

  render() {
    const elevationHeader = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 50, this.state.scrollY],
      outputRange: [0, 5, 5]
    })

    let dummyResults = []
    for (let i = 0; i < 10; i++) {
      dummyResults.push(
        <View key={i} style={{ paddingHorizontal: 15, backgroundColor: Color.white }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ paddingRight: 15, paddingTop: 18 }}>
              <View style={{ width: 40, height: 40, backgroundColor: Color.grayLighter, borderRadius: 40 / 2, alignItems: 'center', justifyContent: 'center' }}>
              </View>
            </View>
            <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingVertical: 15, flex: 1 }}>
              <View style={{ width: 180, height: 16, marginBottom: 9, marginTop: 1, backgroundColor: Color.grayLighter, borderRadius: 4 }}></View>
              <View style={{ width: '100%', height: 15, marginBottom: 4, marginTop: 1, backgroundColor: Color.grayLighter, borderRadius: 4 }}></View>
              <View style={{ width: 120, height: 15, marginBottom: 4, marginTop: 1, backgroundColor: Color.grayLighter, borderRadius: 4 }}></View>
            </View>
          </View>
        </View>
      )
    }
    return (
      <View style={{ flex: 1 }}>
        <Animated.View style={{ backgroundColor: Color.white, elevation: elevationHeader }}>
          <SimpleHeader goBack
            navigation={this.props.navigation}
            mainComponent={
              this.state.region
                ?
                <Input
                  autoFocus={true}
                  returnKeyType='search'
                  style={{ flex: 1 }}
                  value={this.state.search}
                  feather icon="search"
                  placeholder="Cari tempat"
                  onChangeText={this._changeText}
                  onSubmitEditing={this._onSearch}
                />
                :
                <View style={{ flexDirection: 'row', backgroundColor: Color.grayLighter, borderRadius: 10, paddingHorizontal: 15 }}>
                  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: Color.grayLight }}></View>
                  </View>
                  <View style={{ flex: 1, height: 40, padding: 0 }}></View>
                </View>
            }
          />
        </Animated.View>
        {
          !this.state.isSearching
            ?
            !this.props.locations.places ?
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>Pencarian tempat</Text>
                <Text style={{ textAlign: 'center', lineHeight: 18, color: Color.textMuted }}>Masukan nama tempat yang ingin Anda cari</Text>
              </View>
              :
              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                onMomentumScrollEnd={this.scrollEndDrag}
                scrollEventThrottle={16}
                onScroll={Animated.event([
                  {
                    nativeEvent: { contentOffset: { y: this.state.scrollY } }
                  }
                ])}
              >
                {
                  this.props.locations.places.results.length > 0 ?
                    this.props.locations.places.results.map(p => (
                      Platform.OS === 'android' ?
                        <TouchableNativeFeedback
                          onPress={() => {
                            this._chooseLocation(p.geometry.location.lat, p.geometry.location.lng, p.name)
                          }}
                          key={p.id}
                          useForeground={true}
                          background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.15)', false)}
                        >
                          <View style={{ paddingHorizontal: 15, backgroundColor: Color.white }}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ paddingRight: 15, paddingTop: 18 }}>
                                <View style={{ width: 40, height: 40, backgroundColor: Color.grayLighter, borderRadius: 40 / 2, alignItems: 'center', justifyContent: 'center' }}>
                                  <Image style={{ width: 24, height: 24 }} source={{ uri: p.icon }} />
                                </View>
                              </View>
                              <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingVertical: 15, flex: 1 }}>
                                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{p.name}</Text>
                                <Text style={{ color: Color.textMuted, lineHeight: 18 }}>{p.vicinity}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableNativeFeedback>
                        :
                        <TouchableHighlight
                          key={p.id}
                          onPress={() => {
                            this._chooseLocation(p.geometry.location.lat, p.geometry.location.lng, p.name)
                          }}
                          activeOpacity={0.85}
                          underlayColor='#fff'
                        >
                          <View style={{ paddingHorizontal: 15, backgroundColor: Color.white }}>
                            <View style={{ flexDirection: 'row' }}>
                              <View style={{ paddingRight: 15, paddingTop: 18 }}>
                                <View style={{ width: 40, height: 40, backgroundColor: Color.grayLighter, borderRadius: 40 / 2, alignItems: 'center', justifyContent: 'center' }}>
                                  <Image style={{ width: 24, height: 24 }} source={{ uri: p.icon }} />
                                </View>
                              </View>
                              <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingVertical: 15, flex: 1 }}>
                                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>{p.name}</Text>
                                <Text style={{ color: Color.textMuted, lineHeight: 18 }}>{p.vicinity}</Text>
                              </View>
                            </View>
                          </View>
                        </TouchableHighlight>
                    ))
                    :
                    <View style={{ paddingHorizontal: 15 }}>
                      <View style={{ flexDirection: 'row' }}>
                        <View style={{ paddingRight: 15, paddingTop: 18 }}>
                          <View style={{ width: 40, height: 40, backgroundColor: Color.grayLighter, borderRadius: 40 / 2, alignItems: 'center', justifyContent: 'center' }}>
                            <Fa name='map-marker-alt' size={26} color={Color.red} />
                          </View>
                        </View>
                        <View style={{ borderBottomColor: Color.borderColor, borderBottomWidth: 1, paddingVertical: 15, flex: 1 }}>
                          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Tidak ada hasil yang ditemukan</Text>
                          <Text style={{ color: Color.textMuted }}>Maaf kami tidak dapat menemukan tempat yang Anda cari, coba kata kunci lain.</Text>
                        </View>
                      </View>
                    </View>
                }
              </Animated.ScrollView>
            :
            <View style={{ flex: 1, overflow: 'hidden' }}>
              {dummyResults}
            </View>
        }
        {
          this.state.region == null &&
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Color.white, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner isVisible={true} size={100} type='Circle' color={Color.green} />
          </View>
        }
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    locations: state.locations
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dataPlaces: bindActionCreators(dataPlaces, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPlaces)
