import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Linking, View, StyleSheet, Text, Image, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  // Функция изменения полей формы
  const handleInputChange = (name, text) => {
    setFormSignInData((prev) => ({
      ...prev,
      [name]: text,
    }));
  };

  // Обработка входа через Telegram
  const handlePress = async () => {
    try {
      // Запрос на получение ссылки
      const response = await axios.get("https://api.school-hub.ru/auth/telegram/url", {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, 
      });

      const url = response.data?.url;

      if (!url || typeof url !== 'string' || !url.trim()) {
        console.error("Сервер не вернул корректный URL:", url);
        alert("Не удалось получить ссылку для входа. Попробуйте позже.");
        return;
      }

    
      if (!/^https?:\/\//i.test(url.trim())) {
        console.error("Некорректный протокол в URL:", url);
        alert("Некорректная ссылка для открытия.");
        return;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url.trim());
      } else {
        console.error("Система не может открыть URL:", url);
        alert("Не удалось открыть ссылку. Убедитесь, что у вас установлен Telegram.");
      }
    } catch (error) {
      console.error("Ошибка при получении или открытии Telegram-ссылки:", error);

      if (error.code === 'ECONNABORTED') {
        alert("Запрос к серверу занял слишком много времени.");
      } else if (error.response) {
        alert("Сервер вернул ошибку. Попробуйте позже.");
      } else if (error.request) {
        alert("Нет подключения к интернету.");
      } else {
        alert("Произошла ошибка при обработке запроса.");
      }
    }
  };

  
  async function SendLogIn() {
    setValidated(false); 

    try {
      const response = await axios.post("https://api.school-hub.ru/auth", formSignInData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { token } = response.data;

      if (token) {
        await AsyncStorage.setItem('token', token);
        console.log('Токен сохранён:', token);
        navigation.navigate('Main'); // Переход в основное приложение
      }
    } catch (error) {
      console.log("Ошибка авторизации:", error.response?.data || error.message);
      setValidated(true); // Показать ошибку "неверный логин или пароль"
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView style={styles.content}>
        {/* Логотип */}
        <Image
          style={styles.logo}
          source={require("../assets/PushkinLogo.png")}
        />

        {/* Название школы */}
        <Text style={styles.schoolTitle}>Лицей №9 имени А.С.Пушкина</Text>

        {/* Форма входа */}
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

          {validated && (
            <Text style={styles.validate}>Неверный логин или пароль</Text>
          )}

          {/* Кнопка входа */}
          <TouchableOpacity onPress={SendLogIn} style={styles.signInButton}>
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>

          {/* Восстановление пароля */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>

          {/* Или через Telegram */}
          <Text style={styles.orText}>Или используйте для входа:</Text>

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

// Стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
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
    marginRight: 10,
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
  validateinput: {
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
  validate: {
    color: "#fa5757",
    fontSize: 14,
    alignSelf: "flex-start",
    marginLeft: 15,
    marginBottom: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: 15,
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