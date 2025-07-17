import React from "react";
import LogIn from "./components/LogIn";
import Main from "./components/Main";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function Navigate() {
    return <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                name="LogIn"
                component={LogIn}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Main"
                component={Main}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    </NavigationContainer>
}