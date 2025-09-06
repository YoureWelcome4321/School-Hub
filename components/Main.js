import React from "react";
import { View, StyleSheet } from "react-native";
import BottomMenu from "./BottomMenu"; 

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
    backgroundColor: "#000",
  },
  header: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 16,
  },
});