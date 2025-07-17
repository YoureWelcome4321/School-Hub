import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, Image, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';

export default function LogIn({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.content}>
        <Image 
          style={styles.logo}
          source={require('../assets/PushkinLogo.png')}
        />

        <Text style={styles.schoolTitle}>Лицей №9 имени А.С.Пушкина</Text>

        <SafeAreaView style={styles.formContainer}>
          <Text style={styles.formTitle}>Авторизация</Text>

          <TextInput
            placeholder="Логин"
            style={styles.input}
            placeholderTextColor="#a2acb4"
          />
          <TextInput
            placeholder="Пароль"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#a2acb4"
          />

          <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.signInButton}>
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Или используй для входа соцсети:</Text>

          <TouchableOpacity style={styles.telegramButton}>
            <Image style={styles.telelogo}
          source={require('../assets/TelegramLogo.png')}/>
            <Text style={styles.buttonText}>Telegram</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    paddingTop:40,
    paddingBottom:40,
    backgroundColor: '#212121',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo:{
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  telelogo:{
    width: 25,
    height: 25,
    marginRight:5,
  },
  schoolTitle: {
    fontSize: 21,
    width:'70%',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
    color: '#fff',
  },
  formContainer: {
    width: '100%',
    paddingTop: 20,
    paddingBottom:20,
    paddingLeft:15,
    paddingRight:15,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#2c2c2c',
    fontSize: 16,
    color: '#fff',
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  telegramButton: {
    flexDirection: 'row',
    backgroundColor: '#24abec',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',

  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 15,
  },
  orText: {
    marginVertical: 16,
    fontSize: 14,
    color: '#a2acb4',
    textAlign: 'center',
  },
});