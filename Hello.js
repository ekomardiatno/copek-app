import React, { Component } from 'react'
import {
    View,
    Text,
    StyleSheet
} from 'react-native'
import { createAppContainer, createBottomTabNavigator } from 'react-navigation'
import LinearGradient from 'react-native-linear-gradient'
const styles = StyleSheet.create({
    linearGradient: {
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 5
    },
    buttonText: {
        fontSize: 18,
        fontFamily: 'Yantramanav',
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
        backgroundColor: 'transparent',
    },
})

class MainTab extends Component {
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.linearGradient}>
                    <Text style={styles.buttonText}>
                        Hello world!
                    </Text>
                </LinearGradient>
            </View>
        )
    }
}

class SecondTab extends Component {
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Second tab!</Text>
            </View>
        )
    }
}

const TabNavigator = createBottomTabNavigator(
    {
        Hello: MainTab,
        Second: SecondTab
    }
)

const AppContainer = createAppContainer(TabNavigator)

export default AppContainer