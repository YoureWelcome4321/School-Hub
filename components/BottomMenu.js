import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { StyleSheet } from "react-native";
import Settings from "./Settings";
import Shedule from "./Shedule";
import Clubs from "./Clubs";
import News from "./News";

const Tab = createBottomTabNavigator();

export default function BottomMenu() {
  return (
    
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // скрыть заголовок
        }}
        tabBarPosition="bottom"
      >
        <Tab.Screen
          name="Shedule"
          component={Shedule}
          options={{
            tabBarLabel: "Shedule",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="calendar" color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Clubs"
          component={Clubs}
          options={{
            tabBarLabel: "Clubs",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account-group" color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="News"
          component={News}
          options={{
            tabBarLabel: "News",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="newspaper" color={color} size={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarLabel: "Settings",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cog" color={color} size={24} />
            ),
          }}
        />
      </Tab.Navigator>
    
  );
}