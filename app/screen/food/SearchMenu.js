import React, { Component } from 'react'
import { View, Text, ScrollView, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native'
import { SimpleHeader, ItemLists, Items, DummyItems, Input } from '../../components/Components'
import Color, { colorYiq } from '../../components/Color'
import cancellablePromise from '../../helpers/cancellablePromise'
import { HOST_REST_API } from '../../components/Define'
import Animated from 'react-native-reanimated'
const { Extrapolate } = Animated

export default class SearchMenu extends Component {
  timeoutFetch
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      data: [],
      isBottomScrollView: false,
      isFetchReached: false,
      scrolling: true,
      dataEmpty: false,
      status: 'NOT_SEARCH_YET',
      search: '',
      scrollY: new Animated.Value(0),
    }
  }

  pendingPromises = []

  appendPendingPromise = promise => {
    this.pendingPromises = [...this.pendingPromises, promise]
  }

  removePendingPromise = promise => {
    this.pendingPromises = this.pendingPromises.filter(p => p !== promise)
  }

  componentWillUnmount() {
    if (this.props.navigation.getParam('statusbar')) {
      StatusBar.setBarStyle(this.props.navigation.getParam('statusbar').barStyle, true)
      Platform.OS === 'android' &&
        StatusBar.setBackgroundColor(this.props.navigation.getParam('statusbar').background, true)
    }
    if (this.props.navigation.getParam('actionBack')) {
      this.props.navigation.getParam('actionBack')()
    }
    clearInterval(this.timeoutFetch)
    this.pendingPromises.map(p => {
      this.removePendingPromise(p)
    })
  }

  _fetchData = () => {
    const wrappedPromise = cancellablePromise(this._promiseFetch())
    this.appendPendingPromise(wrappedPromise)
    wrappedPromise.promise
      .then(res => {
        this.state.page === 1 && res.length <= 0 &&
          this.setState({
            dataEmpty: true,
            status: 'EMPTY'
          })

        res.length > 0 ?
          this.setState({
            data: [
              ...this.state.data,
              ...res
            ],
            status: 'READY'
          }, () => {
            this.setState({
              isBottomScrollView: false,
              scrolling: true
            })
          })
          :
          this.setState({
            isFetchReached: true,
          }, () => {
            this.setState({
              isBottomScrollView: false,
              scrolling: true
            })
          })
      })
      .then(() => {
        this.removePendingPromise(wrappedPromise)
      })
      .catch(error => {
        Alert.alert(
          'Koneksi gagal',
          'Cek koneksi wifi atau jaringan seluler Anda dan coba lagi',
          [
            {
              text: 'Coba lagi',
              onPress: this._fetchData
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

  _search = search => {
    clearTimeout(this.timeoutFetch)
    this.setState({ search }, () => {
      if (this.state.search !== '') {
        this.timeoutFetch = setTimeout(() => {
          this.setState({
            status: 'LOADING',
            page: 1,
            data: []
          }, () => {
            this._fetchData()
          })
        }, 500)
      } else {
        this.setState({
          status: 'NOT_SEARCH_YET'
        })
      }
    })
  }

  _promiseFetch = () => {
    let { page, search } = this.state
    let { cityName, position } = this.props.navigation.getParam('data')
    cityName = encodeURI(cityName)
    search = encodeURI(search)
    return new Promise((resolve, reject) => {
      fetch(`${HOST_REST_API}food/get?cari=${search}&koordinat=${position.latitude},${position.longitude}&orderby=nearest&kota=${cityName}&page=${page}`)
        .then(res => res.json())
        .then(resolve)
        .catch(reject)
    })
  }

  _navigate = (screen, data) => {
    this.props.navigation.navigate(screen, {
      statusbar: {
        barStyle: 'dark-content',
        background: Color.white
      },
      data: data
    })
  }

  render() {
    const { data, page, isBottomScrollView, isFetchReached, scrolling, status } = this.state
    const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
      const paddingToBottom = 20;
      return layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;
    }
    const elevationHeader = Animated.interpolate(this.state.scrollY, {
      inputRange: [0, 50],
      outputRange: [0, 10],
      extrapolate: 'clamp'
    })
    return (
      <View style={{ flex: 1 }}>
        <Animated.View style={{ elevation: elevationHeader, backgroundColor: Color.white }}>
          <View style={{ paddingTop: StatusBar.currentHeight + 10, paddingBottom: 10, backgroundColor: Color.white }}>
            <Input autoFocus onChangeText={this._search} feather icon="search" style={{ marginHorizontal: 15, marginBottom: 10 }} placeholder="Mau makan apa hari ini?" />
          </View>
        </Animated.View>
        {
          status === 'READY' && data.length > 0 &&
          <Animated.ScrollView
            bounces={false}
            scrollEventThrottle={16}
            onScroll={Animated.event([
              {
                nativeEvent: { contentOffset: { y: this.state.scrollY } }
              }
            ])}
            onMomentumScrollEnd={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                !isFetchReached && scrolling &&
                  this.setState({
                    isBottomScrollView: true,
                    scrolling: false
                  }, () => {
                    this.timeoutFetch = setTimeout(function () {
                      this.setState({
                        page: page + 1
                      }, () => {
                        this._fetchData()
                      })
                    }.bind(this), 3000)
                  })
              } else {
                clearInterval(this.timeoutFetch)
                this.setState({
                  isBottomScrollView: false,
                  scrolling: true
                })
              }
            }}
            onContentSizeChange={(width, height) => {
              isBottomScrollView &&
                this.scrollView._component.scrollResponderScrollToEnd({ animated: true })
            }}
            ref={ref => this.scrollView = ref}
          >
            <Items
              headless={true}
              navigate={this._navigate}
              category='food'
              product={data}
            />
            {
              isBottomScrollView &&
              <View style={{ padding: 15, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={Color.success} />
              </View>
            }
          </Animated.ScrollView>
        }
        {
          status === 'LOADING' &&
          <DummyItems
            headless
            horizontal
          />
        }
        {
          status === 'EMPTY' &&
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>Yah tidak ketemu</Text>
            <Text style={{ textAlign: 'center', lineHeight: 18, color: Color.textMuted }}>Maaf kami tidak dapat menemukan menu yang anda cari</Text>
          </View>
        }
        {
          status === 'NOT_SEARCH_YET' &&
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 6 }}>Mau makan apa?</Text>
            <Text style={{ textAlign: 'center', lineHeight: 18, color: Color.textMuted }}>Cari resto dan menu favoritmu disini</Text>
          </View>
        }
      </View>
    )
  }
}