import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import Navigate from './navigate';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
   <>
    <Navigate style={styles.container}/>
    <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container:{
     backgroundColor:'#000',
  }
});