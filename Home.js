import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Platform,
    Linking,
    Button,
    Text,
    SafeAreaView
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps'
import { AdMobBanner } from 'react-native-admob'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import GPSState from 'react-native-gps-state'
import PolylineEncoder from '@mapbox/polyline'
import Dash from 'react-native-dash'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Sound from 'react-native-sound'

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            polyline: []
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
        Sound.setCategory('Playback')
        this.sound = new Sound('iphone_notification.mp3', Sound.MAIN_BUNDLE, error => {
            if (error) {
                console.log('failed to load the sound', error)
                return
            }
            console.log('duration in seconds: ' + this.sound.getDuration() + 'number of channels: ' + this.sound.getNumberOfChannels())
        })
    }

    componentDidMount() {
        BackgroundGeolocation.on('location', function (location) {
            console.log(location)
        }.bind(this))
        BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started')
        })
        GPSState.addListener(status => {
            switch (status) {
                case GPSState.RESTRICTED:
                    if (Platform.OS === 'android') {
                        GPSState.openLocationSettings()
                    } else {
                        Linking.openURL('app-settings:')
                    }
                    break;

                case GPSState.DENIED:
                    alert('It`s a shame that you do not allowed us to use location :(')
                    break;

                case GPSState.AUTHORIZED_ALWAYS:
                    BackgroundGeolocation.start()
                    break;

                case GPSState.AUTHORIZED_WHENINUSE:
                    BackgroundGeolocation.start()
                    break;
            }
        })
        GPSState.getStatus()
            .then(status => {
                console.log('GPS state status: ', status)
                if (status === 3 || status === 4) {
                    BackgroundGeolocation.start()
                } else if (status === 1) {
                    if (Platform.OS === 'android') {
                        GPSState.openLocationSettings()
                    } else {
                        Linking.openURL('app-settings:')
                    }
                } else if (status === 2) {
                    if (Platform.OS === 'android') {
                        GPSState.openAppDetails()
                    } else {
                        Linking.openURL('app-settings:')
                    }
                } else {
                    GPSState.requestAuthorization(GPSState.AUTHORIZED)
                }
            })
        this._polylineEncode()
    }

    componentWillUnmount() {
        GPSState.removeListener()
        BackgroundGeolocation.removeAllListeners()
    }

    _polylineEncode = async () => {
        let origin = {
            latitude: -0.379803,
            longitude: 102.394354
        }
        let destination = {
            latitude: -0.389475,
            longitude: 102.442707
        }

        let directions = await this._getDirections(origin, destination)
        directions = PolylineEncoder.decode(directions.routes[0].overview_polyline.points)
        directions = directions.map((point, index) => {
            return {
                latitude: point[0],
                longitude: point[1]
            }
        })
        this.setState({
            polyline: directions
        })
    }

    _getDirections = (origin, destination) => {
        return new Promise((resolve, reject) => {
            fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=AIzaSyAxhYU3ruCgYwymJKQ7MtdhCXLtuWweWc0`)
                .then(res => res.json())
                .then(resolve)
                .catch(reject)
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <SafeAreaView>
                    <ScrollView>
                        <View style={{ height: 400, backgroundColor: '#f5f5f5', marginBottom: 15 }}>
                            <MapView
                                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                                style={{ flex: 1 }}
                                region={{
                                    latitude: -0.396063,
                                    longitude: 102.411485,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.0121,
                                }}
                            >
                                {
                                    this.state.polyline.length > 0 &&
                                    <Polyline
                                        coordinates={this.state.polyline}
                                        strokeWidth={4}
                                        strokeColor={'#6ab04c'}
                                    />
                                }
                            </MapView>
                        </View>
                        <Dash dashColor='#ddd' dashThickness={1} style={{ width: '100%', height: 1 }} />
                        <Icon style={{ textAlign: 'center', marginTop: 10, fontSize: 20 }} name='user' />
                        <Text style={{ fontSize: 20, textAlign: 'center', fontFamily: 'Yantramanav', marginVertical: 10 }}>Powered by <Text style={{ fontWeight: 'bold' }}>Eko Mardiatno</Text></Text>
                        <Dash dashColor='#ddd' dashThickness={1} style={{ width: '100%', height: 1 }} />
                        <View style={{ alignItems: 'center', marginBottom: 15, marginTop: 15 }}>
                            <View style={{ backgroundColor: '#f5f5f5', width: 300, height: 250 }}>
                                <AdMobBanner
                                    adSize="mediumRectangle"
                                    adUnitID="ca-app-pub-8047867116429118/7062955117"
                                />
                            </View>
                        </View>
                        <Button title='Hello world!' onPress={() => {
                            this.props.navigation.navigate('Hello')
                            this.sound.play((success) => {
                                if (success) {
                                    console.log('successfully finished playing')
                                } else {
                                    console.log('playback failed due to audio decoding errors')
                                }
                            })
                        }
                        } />
                    </ScrollView>
                </SafeAreaView>
            </View>
        )
    }
}

export default Home