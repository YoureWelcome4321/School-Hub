import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { TouchableOpacity, StyleSheet } from "react-native";
import Settings from "./Settings";
import Shedule from "./Shedule";
import Clubs from "./Clubs";
import { Soon } from "./Soon";
import News from "./News";

const Tab = createBottomTabNavigator();

export default function BottomMenu() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 115,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: "#2c2c2c",
          borderTopWidth: 0,
        },
        tabBarButton: (props) => (
          <TouchableOpacity {...props} activeOpacity={1} />
        ),
      }}
      tabBarPosition="bottom"
    >
      <Tab.Screen
        name="Расписание"
        component={Shedule}
        options={{
          tabBarLabel: "Расписание",
          tabBarLabelStyle: { fontSize: 14 },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Soon"
        component={Soon}
        options={{
          tabBarLabel: "Клубы",
          tabBarLabelStyle: { fontSize: 14 },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="News"
        component={News}
        options={{
          tabBarLabel: "Новости",
          tabBarLabelStyle: { fontSize: 14 },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="newspaper" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Профиль"
        component={Settings}
        options={{
          tabBarLabel: "Профиль",
          tabBarLabelStyle: { fontSize: 14 },
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
