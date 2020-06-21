import React, { Component } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableNativeFeedback,
  Image,
  TextInput,
  ToastAndroid,
  StatusBar,
  Linking,
  Alert,
  Platform,
  TouchableHighlight
} from 'react-native'
import Fa from 'react-native-vector-icons/FontAwesome5'
import Color, { colorYiq } from '../components/Color'
const Sound = require('react-native-sound')
import phoneNumFormat from '../helpers/phoneNumFormat'
import dateFormatted from '../helpers/dateFormatted'
import { NODE_APP_URL } from '../components/Define'
import AsyncStorage from '@react-native-community/async-storage'

export default class Chat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      chats: [],
      socket: null,
      chatText: '',
      driver: null,
      orderId: null,
      status: ''
    }
    this.sound = new Sound('iphone_send_sms.mp3', Sound.MAIN_BUNDLE)
  }

  componentDidMount() {
    Platform.OS === 'android' &&
      StatusBar.setBackgroundColor(Color.primary, true)
    StatusBar.setBarStyle('dark-content', true)
    if (this.props.navigation.getParam('backListener')) {
      this.props.navigation.getParam('backListener').remove()
    }

    if (this.props.navigation.getParam('data')) {
      const { chats, socket, receiverId, driver, orderId, status } = this.props.navigation.getParam('data')
      this.setState({
        chats,
        socket,
        driver,
        orderId,
        status
      }, () => {
        const { socket } = this.state
        if (socket !== null && socket !== undefined) {
          socket.on('connect', function () {
            this._getChats !== null ? this._getChats() : null
          }.bind(this))
          socket.on(`${receiverId}_receive_chat`, function (chat) {
            this._putChat !== null ? this._putChat(chat) : null
          }.bind(this))
        }
      })
    }
  }

  _putChat = (chat) => {
    this.setState({
      chats: [
        ...this.state.chats,
        {
          ...chat
        }
      ]
    }, () => {
      this._saveOnStorage({
        orderId: chat.orderId,
        sender: chat.sender,
        text: chat.text,
        dateTime: chat.dateTime
      })
    })
  }

  _getChats = () => {
    const { orderId } = this.state
    if (orderId !== null) {
      fetch(`${NODE_APP_URL}chats/${orderId}`)
        .then(res => res.json())
        .then(chat => {
          if (chat.length > 0) {
            this.setState({
              chats: chat
            }, () => {
              AsyncStorage.getItem('chats', (err, res) => {
                if (res !== null) {
                  res = JSON.parse(res)
                  let chatArray = []
                  res.map(a => {
                    a.orderId !== orderId && chatArray.push(a)
                  })
                  AsyncStorage.setItem('chats', JSON.stringify(chatArray.concat(chat)))
                } else {
                  AsyncStorage.setItem('chats', JSON.stringify([chat]))
                }
              })
            })
          }
        })
        .catch(err => {
          Alert.alert(
            'Gagal mendapatkan obrolan',
            'Cek koneksi wifi atau jaringan seluler anda dan coba lagi',
            [
              {
                text: 'Coba lagi',
                onPress: this._getChats
              }
            ],
            { cancelable: true }
          )
        })
    }
  }

  componentWillUnmount() {
    if (this.props.navigation.getParam('backListener')) {
      this.props.navigation.getParam('backListener').add()
    }
    if (this.props.navigation.getParam('data')) {
      this.props.navigation.getParam('data').noNewChat()
      this.props.navigation.getParam('data').pushChat(this.state.chats)
    }
    if (this.props.navigation.getParam('statusbar')) {
      StatusBar.setBarStyle(this.props.navigation.getParam('statusbar').barStyle, true)
      Platform.OS === 'android' &&
        StatusBar.setBackgroundColor(this.props.navigation.getParam('statusbar').background, true)
    }
    this.setState({
      socket: null
    })
    this._getChats = null
    this._putChat = null
  }

  _onSendChat = () => {
    const { socket, chatText, driver, orderId } = this.state
    if (chatText.length > 0) {
      fetch(`${NODE_APP_URL}chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
          sender: 'customer',
          text: chatText
        })
      })
        .then(res => res.json())
        .then(chat => {
          this.setState({
            chats: [
              ...this.state.chats,
              {
                orderId: chat.orderId,
                sender: chat.sender,
                text: chat.text,
                dateTime: chat.dateTime
              }
            ],
            chatText: ''
          }, () => {
            this.sound.play()
            this._saveOnStorage({
              orderId: chat.orderId,
              sender: chat.sender,
              text: chat.text,
              dateTime: chat.dateTime
            })
            socket.emit('send_chat', {
              receiverId: driver.driverId,
              data: {
                orderId: chat.orderId,
                sender: chat.sender,
                text: chat.text,
                dateTime: chat.dateTime
              }
            })
          })
        })
    }
  }

  _saveOnStorage = (data) => {
    AsyncStorage.getItem('chats', (error, chat) => {
      if (chat !== null) {
        chat = JSON.parse(chat)
        chat.push(data)
        AsyncStorage.setItem('chats', JSON.stringify(chat))
      } else {
        AsyncStorage.setItem('chats', JSON.stringify([data]))
      }
    })
  }

  render() {
    let { chats, driver } = this.state
    return (
      <View style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Color.primary, elevation: 5 }}>
          <View style={{ padding: 10, paddingLeft: 15 }}>
            {
              Platform.OS === 'android' ?
                <TouchableNativeFeedback
                  onPress={() => this.props.navigation.goBack()}
                  useForeground={true}
                  background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.25)', false)}
                >
                  <View style={{ width: 35, height: 35, borderRadius: 35 / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.primary, overflow: 'hidden' }}>
                    <Fa size={20} name="chevron-left" />
                  </View>
                </TouchableNativeFeedback>
                :
                <TouchableHighlight
                  style={{ borderRadius: 35 / 2 }}
                  activeOpacity={0.85}
                  underlayColor='#fff'
                  onPress={() => this.props.navigation.goBack()}
                >
                  <View style={{ width: 35, height: 35, borderRadius: 35 / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.primary, overflow: 'hidden' }}>
                    <Fa size={20} name="chevron-left" />
                  </View>
                </TouchableHighlight>
            }
          </View>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: Color.secondary }}>
              {
                driver !== null ?
                  <Image style={{ width: 42, height: 42, borderRadius: 42 / 2 }} source={{ uri: getImageThumb(driver.driverPicture, 'sm') }} />
                  :
                  null
              }
            </View>
            <View style={{ paddingHorizontal: 10 }}>
              {
                driver !== null ?
                  <View>
                    <Text numberOfLines={1} style={{ fontSize: 17, marginBottom: 3 }}>{driver.driverName}</Text>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: Color.gray, letterSpacing: 1 }}>{driver.driverVRP}</Text>
                  </View>
                  :
                  <View>
                    <View style={{ height: 17, width: 120, backgroundColor: Color.textColor, marginBottom: 2 }} />
                    <View style={{ height: 12, width: 80, backgroundColor: Color.textColor }} />
                  </View>
              }
            </View>
          </View>
          <View style={{ flexDirection: 'row', padding: 5, paddingRight: 15 }}>
            <View style={{ marginHorizontal: 2.5 }}>
              {
                Platform.OS === 'android' ?
                  <TouchableNativeFeedback
                    onPress={() => Linking.openURL(`tel://${driver.driverPhone}`)}
                    useForeground={true}
                    background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.25)', false)}
                  >
                    <View style={{ width: 35, height: 35, borderRadius: 35 / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.secondary, overflow: 'hidden' }}>
                      <Fa color={colorYiq(Color.secondary)} size={16} name="phone" />
                    </View>
                  </TouchableNativeFeedback>
                  :
                  <TouchableHighlight
                    style={{ borderRadius: 35 / 2 }}
                    activeOpacity={0.85}
                    underlayColor='#fff'
                    onPress={() => Linking.openURL(`tel://${driver.driverPhone}`)}
                  >
                    <View style={{ width: 35, height: 35, borderRadius: 35 / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.secondary, overflow: 'hidden' }}>
                      <Fa color={colorYiq(Color.secondary)} size={16} name="phone" />
                    </View>
                  </TouchableHighlight>
              }
            </View>
            <View style={{ marginHorizontal: 2.5 }}>
              {
                Platform.OS === 'android' ?
                  <TouchableNativeFeedback
                    onPress={() => Linking.openURL(`whatsapp://send?phone=${phoneNumFormat(driver.driverPhone)}`)}
                    useForeground={true}
                    background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.25)', false)}
                  >
                    <View style={{ width: 35, height: 35, borderRadius: 35 / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.secondary, overflow: 'hidden' }}>
                      <Fa color={colorYiq(Color.secondary)} size={16} name="whatsapp" />
                    </View>
                  </TouchableNativeFeedback>
                  :
                  <TouchableHighlight
                    style={{ borderRadius: 35 / 2 }}
                    activeOpacity={0.85}
                    underlayColor='#fff'
                    onPress={() => Linking.openURL(`whatsapp://send?phone=${phoneNumFormat(driver.driverPhone)}`)}
                  >
                    <View style={{ width: 35, height: 35, borderRadius: 35 / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Color.secondary, overflow: 'hidden' }}>
                      <Fa color={colorYiq(Color.secondary)} size={16} name="whatsapp" />
                    </View>
                  </TouchableHighlight>
              }
            </View>
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: Color.grayLighter }}>
          {
            chats.length <= 0 ?
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: Color.textMuted }}>Layanan chat (beta)</Text>
                <Text style={{ textAlign: 'center', color: Color.textMuted }}>Layanan chat belum sempurna, disarankan menelepon langsung ke nomor HP driver atau menggunakan Whatsapp</Text>
              </View>
              :
              <ScrollView
                ref={ref => this._scrollView = ref}
                onContentSizeChange={(contentWidth, contentHeight) => {
                  this._scrollView.scrollToEnd({ animated: true })
                }}
              >
                {
                  chats.map((chat, i) => {
                    if (chat.sender === 'driver') {
                      return (
                        <View key={i} style={{ paddingHorizontal: 15, paddingVertical: 5, paddingRight: 50 }}>
                          <View style={{
                            flexDirection: 'row', marginTop: i === 0 ? 10 : 0, marginBottom:
                              chats[i + 1] === undefined ?
                                i === chats.length - 1 ? 10 : 0
                                :
                                chat.sender !== chats[i + 1].sender ? 10 : 0
                          }}>
                            <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Color.grayLight, borderRadius: 15, elevation: 1 }}>
                              <Text style={{ lineHeight: 16 }}>{chat.text}</Text>
                              <Text style={{ textAlign: 'right', marginLeft: 25, fontSize: 10, color: Color.textMuted }}>{dateFormatted(chat.dateTime, true, true)}</Text>
                            </View>
                          </View>
                        </View>
                      )
                    } else {
                      return (
                        <View key={i} style={{
                          paddingHorizontal: 15, paddingVertical: 5, paddingLeft: 50, alignItems: 'flex-end', marginTop: i === 0 ? 10 : 0, marginBottom:
                            chats[i + 1] === undefined ?
                              i === chats.length - 1 ? 10 : 0
                              :
                              chat.sender !== chats[i + 1].sender ? 10 : 0
                        }}>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Color.primary, borderRadius: 15, elevation: 1 }}>
                              <Text style={{ lineHeight: 16, color: colorYiq(Color.primary) }}>{chat.text}</Text>
                              <Text style={{ textAlign: 'right', marginLeft: 25, fontSize: 10, color: Color.secondary }}>{dateFormatted(chat.dateTime, true, true)}</Text>
                            </View>
                          </View>
                        </View>
                      )
                    }
                  })
                }
              </ScrollView>
          }
        </View>
        <View style={{ paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: Color.grayLighter }}>
          {
            this.state.status === 'completed' || this.state.status === 'cancelled_by_driver' || this.state.status === 'cancelled_by_user' ?
              <View style={{ backgroundColor: Color.grayLight, height: 45, flex: 1, borderRadius: 45 / 2, elevation: 1, paddingHorizontal: 15, justifyContent: 'center' }}>
                <Text style={{ color: Color.textMuted, fontSize: 14 }}>Sesi obrolan berakhir</Text>
              </View>
              :
              <TextInput
                multiline
                value={this.state.chatText}
                onChangeText={chatText => this.setState({ chatText })}
                style={{ flex: 1, color: Color.textColor, fontFamily: 'Yantramanav', fontSize: 14, backgroundColor: Color.white, paddingVertical: 6, paddingHorizontal: 15, minHeight: 45, maxHeight: 90, borderRadius: 45 / 2, elevation: 1 }} placeholder='Masukkan pesan'
              />
          }
          {
            this.state.status === 'completed' || this.state.status === 'cancelled_by_driver' || this.state.status === 'cancelled_by_user' ?
              <View style={{ width: 45, height: 45, marginLeft: 10, borderRadius: 45 / 2, backgroundColor: Color.gray, alignItems: 'center', justifyContent: 'center', elevation: 1, overflow: 'hidden' }}>
                <Fa size={18} color={colorYiq(Color.gray)} name='paper-plane' />
              </View>
              :
              Platform.OS === 'android' ?
                <TouchableNativeFeedback
                  onPress={this._onSendChat}
                  useForeground={true}
                  background={TouchableNativeFeedback.Ripple('rgba(0,0,0,.25', false)}
                >
                  <View style={{ width: 45, height: 45, marginLeft: 10, borderRadius: 45 / 2, backgroundColor: Color.green, alignItems: 'center', justifyContent: 'center', elevation: 1, overflow: 'hidden' }}>
                    <Fa size={18} color={colorYiq(Color.green)} name='paper-plane' />
                  </View>
                </TouchableNativeFeedback>
                :
                <TouchableHighlight
                  style={{ borderRadius: 45 / 2 }}
                  activeOpacity={0.85}
                  underlayColor='#fff'
                  onPress={this._onSendChat}
                >
                  <View style={{ width: 45, height: 45, marginLeft: 10, borderRadius: 45 / 2, backgroundColor: Color.green, alignItems: 'center', justifyContent: 'center', elevation: 1, overflow: 'hidden' }}>
                    <Fa size={18} color={colorYiq(Color.green)} name='paper-plane' />
                  </View>
                </TouchableHighlight>
          }
        </View>
      </View>
    )
  }
}