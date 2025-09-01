import { StatusBar } from "expo-status-bar";
import {
  Linking,
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export function Soon() {
  return (
    <>
    <View style={styles.container}>
      <Text style={styles.nodataemoji}>🏗️</Text>
      <Text style={styles.noData}>
        Раздел в разработке, следите за обновлениями
      </Text>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    paddingTop:190,
    backgroundColor: "#212121"
  },
  noData: {
    textAlign: "center",
    color: "#a0a9b1",
    fontSize: 18,
    marginTop: 19,
  },
  nodataemoji: {
    textAlign: "center",
    color: "#a0a9b1",
    fontSize: 134,
    marginTop: 19,
  },
});
