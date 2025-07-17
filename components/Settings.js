import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';

export default function Settings() {
  return (
    <SafeAreaView >
      <StatusBar style="auto" />
      <SafeAreaView >
        <Text>
            Настройки
        </Text>
      </SafeAreaView>
    </SafeAreaView>
  );
}