import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import {
  View,
  StyleSheet,
  Text,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "",
    surname: "",
    telegram_name: "",
    login: "",
    class_letter: "",
    class_number: 0,
    name: "",
  });

  const navigation = useNavigation();

  async function Exit() {
    await AsyncStorage.removeItem('token');
    navigation.navigate('LogIn');
    console.log('Выход из аккаунта');
  }

  // Сохраняем оригинальные данные при загрузке
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    async function getProfileData() {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          showToast("error", "Ошибка", "Токен не найден. Войдите снова.");
          return;
        }

        const response = await axios.get("https://api.school-hub.ru/settings/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setProfileData(data);
        setOriginalData(data);
      } catch (error) {
        console.log("Ошибка при загрузке профиля:", error.response?.data || error.message);
        showToast("error", "Ошибка", "Не удалось загрузить данные профиля.");
      }
    }

    getProfileData();
  }, []);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = async () => {
    if (isEditing) {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          showToast("error", "Ошибка", "Токен не найден.");
          return;
        }

        const updates = [];

        if (profileData.login !== originalData.login) {
          updates.push(
            axios.post(
              "https://api.school-hub.ru/settings/login/set",
              { login: profileData.login },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            )
          );
        }

        if (profileData.email !== originalData.email) {
          updates.push(
            axios.post(
              "https://api.school-hub.ru/settings/email/set",
              { email: profileData.email },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            )
          );
        }

        if (updates.length > 0) {
          await Promise.all(updates);
          setOriginalData({ ...profileData });
          showToast("success", "Успех", "Данные успешно обновлены!");
        } else {
          showToast("info", "Без изменений", "Изменений не обнаружено.");
        }
      } catch (error) {
        console.log("Ошибка при сохранении:", error.response?.data || error.message);
        const message = error.response?.data?.message || "Не удалось сохранить изменения.";
        showToast("error", "Ошибка", message);
      }
    }

    setIsEditing(!isEditing);
  };

  // Функция для показа тоста
  const showToast = (type, title, message) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      position: 'top',
      topOffset: 50,
      props: {
        backgroundColor: type === 'success' ? '#007AFF' : type === 'error' ? '#e74c3c' : '#3498db',
        textColor: '#fff',
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.headeronmenu}>
        <Text style={styles.header}>Профиль</Text>
      </View>

      <View style={styles.profilecontainer}>
        <SafeAreaView style={styles.osnov}>
          <Image
            style={styles.profileIcon}
            source={require("../assets/Profile.png")}
          />
          <Text style={styles.fio}>
            {profileData.name} {profileData.surname?.[0]}.
          </Text>
          <Text style={styles.class}>
            {profileData.class_number}{profileData.class_letter} класс
          </Text>
        </SafeAreaView>

        <TouchableOpacity onPress={toggleEdit} style={styles.forgotPassword}>
          <MaterialCommunityIcons name="draw" color="#007AFF" size={24} />
          <Text style={styles.forgotPasswordText}>
            {isEditing ? 'Сохранить изменения' : 'Редактировать'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.inputholder}>Логин:</Text>
        <TextInput
          style={[styles.input, isEditing && styles.inputEditing]}
          value={profileData.login}
          onChangeText={(text) => handleChange("login", text)}
          placeholder="@username"
          placeholderTextColor="#888"
          editable={isEditing}
        />

        <Text style={styles.inputholder}>Почта:</Text>
        <TextInput
          style={[styles.input, isEditing && styles.inputEditing]}
          value={profileData.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          editable={isEditing}
        />

        <Text style={styles.inputholder}>Пароль:</Text>
        <TextInput
          style={styles.input}
          value="••••••••"
          placeholder="Пароль"
          placeholderTextColor="#888"
          secureTextEntry
          editable={false}
        />

        <TouchableOpacity style={styles.telegramButton}>
          <Image
            style={styles.telelogo}
            source={require("../assets/TelegramLogo.png")}
          />
          <Text style={styles.buttonText}>Привязать Telegram</Text>
        </TouchableOpacity>

        <View style={styles.exitanddelete}>
          <TouchableOpacity style={styles.Exit} onPress={Exit}>
            <MaterialCommunityIcons
              name="exit-to-app"
              color="#fa5757"
              size={24}
            />
            <Text style={styles.exitText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Компонент Toast */}
      <Toast
        config={{
          success: (internal) => (
            <View style={[styles.toastContainer, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.toastText}>{internal.text1}</Text>
              {internal.text2 ? <Text style={styles.toastTextSecondary}>{internal.text2}</Text> : null}
            </View>
          ),
          error: (internal) => (
            <View style={[styles.toastContainer, { backgroundColor: '#e74c3c' }]}>
              <Text style={styles.toastText}>{internal.text1}</Text>
              {internal.text2 ? <Text style={styles.toastTextSecondary}>{internal.text2}</Text> : null}
            </View>
          ),
          info: (internal) => (
            <View style={[styles.toastContainer, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.toastText}>{internal.text1}</Text>
              {internal.text2 ? <Text style={styles.toastTextSecondary}>{internal.text2}</Text> : null}
            </View>
          ),
        }}
      />
    </View>
  );
}

// Стили для тостов
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    paddingTop: 32,
    overflow: "hidden",
  },
  profilecontainer: {
    width: "100%",
    marginVertical: 8,
    paddingHorizontal: 32,
  },
  header: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 22,
  },
  fio: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 24,
    marginTop: 10,
    marginBottom: 1,
  },
  class: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 24,
    marginBottom: 4,
  },
  forgotPassword: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 15,
    marginLeft: 1,
  },
  profileIcon: {
    width: 90,
    height: 90,
    alignSelf: "center",
    borderRadius: 45,
  },
  osnov: {
    marginTop: 15,
  },
  inputholder: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    marginTop: 16,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#2c2c2c",
    fontSize: 16,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#2c2c2c",
  },
  inputEditing: {
    borderColor: "#007AFF",
  },
  telegramButton: {
    flexDirection: "row",
    backgroundColor: "#24abec",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 16,
    marginHorizontal: "auto",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "65%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  telelogo: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  Exit: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: {
    color: "#fa5757",
    fontSize: 15,
    marginLeft: 6,
  },

  // Стили для Toast
  toastContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  toastTextSecondary: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
  },
});