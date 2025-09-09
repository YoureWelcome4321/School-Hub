import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ForgotPassword() {
  const navigate = useNavigation();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://api.school-hub.ru/auth/forgot_password",
        {
          identifier: login,
          new_password: password,
        }
      );
      setSent(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, backgroundColor: "#212121" }}>
        <View style={{ alignSelf: "flex-start" }}>
          <TouchableOpacity onPress={() => navigate.navigate("LogIn")}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Text style={styles.titleEmoji}>🔒</Text>
          <Text style={styles.title}>Восстановление пароля</Text>
          {!sent ? (
            <>
              <Text style={styles.label}>Введите ваш логин</Text>
              <TextInput
                style={styles.input}
                placeholder="Логин"
                placeholderTextColor="#888"
                value={login}
                onChangeText={setLogin}
                autoCapitalize="none"
              />
              <Text style={styles.label}>Введите новый пароль</Text>
              <TextInput
                style={styles.input}
                placeholder="Новый пароль"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.button} onPress={handleSend}>
                <Text style={styles.buttonText}>Отправить письмо</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                Письмо успешно отправлено на вашу почту!
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  backText: {
    color: "#007AFF",
    fontSize: 22,
    marginTop: 67,
    marginLeft: 15,
  },
  titleEmoji: {
    fontSize: 104,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginTop: 6,
    width: "100%",
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#2c2c2c",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  infoText: {
    color: "#2ecc71",
    fontSize: 19,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "600",
  },
});
