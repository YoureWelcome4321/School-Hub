import React from "react";
import LogIn from "./components/LogIn";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function Navigate() {
    return <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                name="Login"
                component={LogIn}
            />
        </Stack.Navigator>
    </NavigationContainer>
}