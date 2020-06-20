import React, { Component } from 'react'
import {
    View,
    Text
} from 'react-native'
import { createAppContainer, createBottomTabNavigator } from 'react-navigation'

class MainTab extends Component {
    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Hello world!</Text>
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