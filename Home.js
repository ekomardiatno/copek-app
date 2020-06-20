import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Platform,
    Linking,
    Button
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import { AdMobBanner } from 'react-native-admob'
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
import GPSState from 'react-native-gps-state'

class Home extends Component {
    constructor(props) {
        super(props)
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
    }

    componentWillUnmount() {
        GPSState.removeListener()
        BackgroundGeolocation.removeAllListeners()
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView>
                    <View style={{ height: 400, backgroundColor: '#f5f5f5', marginBottom: 15 }}>
                        <MapView
                            provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                            style={{ flex: 1 }}
                            region={{
                                latitude: 37.78825,
                                longitude: -122.4324,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.0121,
                            }}
                        >
                        </MapView>
                    </View>
                    <View style={{ alignItems: 'center', marginBottom: 15 }}>
                        <View style={{ backgroundColor: '#f5f5f5', width: 300, height: 250 }}>
                            <AdMobBanner
                                adSize="mediumRectangle"
                                adUnitID="ca-app-pub-8047867116429118/7062955117"
                            />
                        </View>
                    </View>
                    <Button title='Hello world!' onPress={() => this.props.navigation.navigate('Hello')} />
                </ScrollView>
            </View>
        )
    }
}

export default Home