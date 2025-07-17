import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';

export default function Shedule() {
  return (
    <SafeAreaView >
      <StatusBar style="auto" />
      <SafeAreaView >
        <Text>
            Расписание
        </Text>
      </SafeAreaView>
    </SafeAreaView>
  );
}