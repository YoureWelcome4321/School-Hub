import { StatusBar } from "expo-status-bar";
import React from "react";
import { Linking } from 'react-native';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import axios from "axios";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogIn() {

  const navigation = useNavigation();

  const [formSignInData, setFormSignInData] = useState({
    identifier: "",
    password: "",
  });

  const [validated, setValidated] = useState(false);

  const [tgUrl, setUrl] = useState()

  const handleInputChange = (name, text) => {
  setFormSignInData((prev) => ({
    ...prev,
    [name]: text,
  }));
};

 const handlePress = () => {
    GetTg()
    Linking.openURL(tgUrl).catch(err => console.error("Не удалось открыть URL:", err));
  };


  async function SendLogIn() {
    try {
      const response = await axios.post("https://api.school-hub.ru/auth", formSignInData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      try {
        await AsyncStorage.setItem('token', response.data.token);
        console.log('Ваш токен:', response.data.token);
      } catch (e) {
       console.log("Ошибка сохранения токена:", e);
      }
      
      if (response.data.token) {
        navigation.navigate('Main')
      }

    } catch (error) {

      if (error.response) {
      
        console.log("Данные ошибки:", error.response.data);
        console.log("Статус:", error.response.status);
        console.log("Заголовки:", error.response.headers);
      } else if (error.request) {
       
        console.log("Нет ответа от сервера:", error.request);
      } else {

        console.log("Ошибка настройки:", error.message);
      }
      setValidated(true);
    }
  }


  async function GetTg() {
    try {
      const response = await axios.get("https://api.school-hub.ru/auth/telegram/url", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response)
      setUrl(response.data.url)
    } catch (error) {
        console.log("Нет ответа от сервера:", error.request);
    }
  }



  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.content}>
      
        <Image
          style={styles.logo}
          source={require("../assets/PushkinLogo.png")}
        />

        <Text style={styles.schoolTitle}>Лицей №9 имени А.С.Пушкина</Text>

        <SafeAreaView style={styles.formContainer}>
          <Text style={styles.formTitle}>Авторизация</Text>

          <TextInput
            placeholder="Логин"
            style={validated ? styles.validateinput : styles.input}
            placeholderTextColor="#a2acb4"
            onChangeText={(text) => handleInputChange("identifier", text)}
            value={formSignInData.identifier}
          />
          <TextInput
            placeholder="Пароль"
            secureTextEntry
            style={validated ? styles.validateinput : styles.input}
            placeholderTextColor="#a2acb4"
            onChangeText={(text) => handleInputChange("password", text)}
            value={formSignInData.password}
          />
          {validated &&
            <Text style={styles.validate}>Неверный логин или пароль</Text>}

          <TouchableOpacity
            onPress={SendLogIn}
            style={styles.signInButton}
          >
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Или используй для входа соцсети:</Text>

          <TouchableOpacity onPress={handlePress} style={styles.telegramButton}>
            <Image
              style={styles.telelogo}
              source={require("../assets/TelegramLogo.png")}
            />
            <Text style={styles.buttonText}>Telegram</Text>
          </TouchableOpacity>
        </SafeAreaView>
       
      </SafeAreaView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: "#212121",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  telelogo: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  schoolTitle: {
    fontSize: 21,
    width: "70%",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },
  formContainer: {
    width: "100%",
    paddingBottom: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#2c2c2c",
    fontSize: 16,
    color: "#fff",
  },
  validateinput:{
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fa5757",
    backgroundColor: "#2c2c2c",
    fontSize: 16,
    color: "#fff",
  },

  validate:{
    color: "#fa5757",
    marginBottom: 6,
  },
  signInButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  telegramButton: {
    flexDirection: "row",
    backgroundColor: "#24abec",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 15,
  },
  orText: {
    marginVertical: 16,
    fontSize: 14,
    color: "#a2acb4",
    textAlign: "center",
  },
});
