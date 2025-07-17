import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import BottomMenu from "./BottomMenu"; // или путь к BottomMenu

export default function Main({ navigation }) {
  return (
    <View style={styles.container}>
      
      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 16,
  },
});