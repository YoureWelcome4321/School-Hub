import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { Linking } from "react-native";

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const [profileData, setProfileData] = useState({
    email: "",
    surname: "",
    telegram_name: "",
    login: "",
    class_letter: "",
    class_number: 0,
    name: "",
  });

  const [originalData, setOriginalData] = useState({});
  const navigation = useNavigation();
  const [tgUrl, setUrl] = useState();

  const showToast = (type, title, message) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      position: "top",
      topOffset: 40,
    });
  };

  const getProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showToast("error", "Ошибка", "Токен не найден.");
        return;
      }

      const response = await axios.get(
        "https://api.school-hub.ru/settings/info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data;
      setProfileData(data);
      setOriginalData(data);
      if (data.email) setEmailInput(data.email);
    } catch (error) {
      console.log(
        "Ошибка загрузки профиля:",
        error.response?.data || error.message
      );
      showToast("error", "Ошибка", "Не удалось загрузить данные.");
    }
  };

  useEffect(() => {
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
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
        }

        if (profileData.email && profileData.email !== originalData.email) {
          updates.push(
            axios.post(
              "https://api.school-hub.ru/settings/email/set",
              { email: profileData.email },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
        }

        if (updates.length > 0) {
          await Promise.all(updates);
          setOriginalData({ ...profileData });
          showToast("success", "Успех", "Данные обновлены.");
        } else {
          showToast("info", "Без изменений", "Изменений нет.");
        }
      } catch (error) {
        const message =
          error.response?.data?.message || "Не удалось сохранить.";
        showToast("error", "Ошибка", message);
      }
    }

    setIsEditing(!isEditing);
    if (isEditing) setShowChangePassword(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast("error", "Ошибка", "Заполните все поля.");
      return;
    }

    if (newPassword.length < 6) {
      showToast("error", "Ошибка", "Пароль ≥ 6 символов.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "https://api.school-hub.ru/settings/password/change",
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Готово", "Пароль изменён.");
      setCurrentPassword("");
      setNewPassword("");
      setShowChangePassword(false);
    } catch (error) {
      const message =
        error.response?.data?.message || "Неверный текущий пароль.";
      showToast("error", "Ошибка", message);
    }
  };

  const handlePress = () => {
    GetTg();
    Linking.openURL(tgUrl).catch((err) =>
      console.error("Не удалось открыть URL:", err)
    );
  };

  async function GetTg() {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://api.school-hub.ru/settings/telegram/connect",
        {
          headers: {
            "Content-Type": "application/json",
            headers: { Authorization: `Bearer ${token}` },
          },
        }
      );
      console.log(response);
      setUrl(response.data.url);
    } catch (error) {
      console.log("Нет ответа от сервера:", error.request);
    }
  }

  const handleAddEmail = async () => {
    if (!emailInput.includes("@")) {
      showToast("error", "Ошибка", "Введите корректный email.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "https://api.school-hub.ru/settings/email/set",
        { email: emailInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfileData((prev) => ({ ...prev, email: emailInput }));
      setOriginalData((prev) => ({ ...prev, email: emailInput }));
      setIsAddingEmail(false);
      showToast("success", "Почта добавлена", "Проверьте письмо.");
    } catch (error) {
      const message = error.response?.data?.message || "Не удалось добавить.";
      showToast("error", "Ошибка", message);
    }
  };

  const Exit = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("LogIn");
    showToast("info", "Выход", "Вы вышли из аккаунта.");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <SafeAreaView style={styles.containerInner}>
          {/* Заголовок и аватар */}
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Профиль</Text>
          </View>

          <View style={styles.profileSection}>
            <Image
              source={require("../assets/Profile.png")}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {profileData.name} {profileData.surname?.[0]}.
            </Text>
            <Text style={styles.class}>
              {profileData.class_number}
              {profileData.class_letter} класс
            </Text>
          </View>

          <TouchableOpacity onPress={toggleEdit} style={styles.editButton}>
            <MaterialCommunityIcons name="draw" color="#007AFF" size={20} />
            <Text style={styles.editButtonText}>
              {isEditing ? "Сохранить" : "Редактировать"}
            </Text>
          </TouchableOpacity>

          {/* Логин */}
          <Text style={styles.label}>Логин</Text>
          <TextInput
            style={[styles.input, isEditing && styles.inputActive]}
            value={profileData.login}
            onChangeText={(text) => handleChange("login", text)}
            placeholder="@username"
            placeholderTextColor="#888"
            editable={isEditing}
          />

          {/* Почта */}
          <Text style={styles.label}>Почта</Text>
          {profileData.email ? (
            <TextInput
              style={[styles.input, isEditing && styles.inputActive]}
              value={profileData.email}
              onChangeText={(text) => handleChange("email", text)}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              editable={isEditing}
            />
          ) : !isAddingEmail ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsAddingEmail(true)}
            >
              <Text style={styles.actionButtonText}>Привязать почту</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emailRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder="Введите email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleAddEmail}
              >
                <Text style={styles.confirmText}>✓</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Пароль */}
          <Text style={styles.label}>Пароль</Text>
          {isEditing ? (
            showChangePassword ? (
              <>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Текущий пароль"
                  placeholderTextColor="#888"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Новый пароль"
                  placeholderTextColor="#888"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <View style={styles.passwordActions}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#666" }]}
                    onPress={() => setShowChangePassword(false)}
                  >
                    <Text style={styles.smallText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: "#007AFF" }]}
                    onPress={handleChangePassword}
                  >
                    <Text style={styles.smallText}>Сменить</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowChangePassword(true)}
              >
                <Text style={styles.actionButtonText}>Сменить пароль</Text>
              </TouchableOpacity>
            )
          ) : (
            <TextInput
              style={styles.input}
              value="••••••••"
              placeholder="Пароль"
              placeholderTextColor="#888"
              secureTextEntry
              editable={false}
            />
          )}

          {/* Telegram */}
          <TouchableOpacity onPress={handlePress} style={styles.telegramBtn}>
            <Image
              source={require("../assets/TelegramLogo.png")}
              style={styles.tgIcon}
            />
            <Text style={styles.tgText}>Привязать Telegram</Text>
          </TouchableOpacity>

          {/* Выход */}
          <TouchableOpacity style={styles.logoutBtn} onPress={Exit}>
            <MaterialCommunityIcons
              name="exit-to-app"
              color="#fa5757"
              size={20}
            />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>

      {/* Toast */}
      <Toast
        config={{
          success: (internal) => (
            <View style={[styles.toast, { backgroundColor: "#2ecc71" }]}>
              <Text style={styles.toastTitle}>{internal.text1}</Text>
              {internal.text2 && (
                <Text style={styles.toastMsg}>{internal.text2}</Text>
              )}
            </View>
          ),
          error: (internal) => (
            <View style={[styles.toast, { backgroundColor: "#e74c3c" }]}>
              <Text style={styles.toastTitle}>{internal.text1}</Text>
              {internal.text2 && (
                <Text style={styles.toastMsg}>{internal.text2}</Text>
              )}
            </View>
          ),
          info: (internal) => (
            <View style={[styles.toast, { backgroundColor: "#3498db" }]}>
              <Text style={styles.toastTitle}>{internal.text1}</Text>
              {internal.text2 && (
                <Text style={styles.toastMsg}>{internal.text2}</Text>
              )}
            </View>
          ),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  containerInner: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  headerContainer: {
    width: "100%",
    marginBottom: 26,
  },
  header: {
    fontSize: 26,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  class: {
    fontSize: 18,
    color: "#aaa",
    marginTop: 4,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 6,
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 6,
    width: "100%",
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: "#2c2c2c",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#2c2c2c",
    marginBottom: 16,
  },
  inputActive: {
    borderColor: "#007AFF",
  },
  actionButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  emailRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 16,
  },
  confirmBtn: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  passwordActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  smallBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  smallText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  telegramBtn: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 12,
    width: "68%",
  },
  tgIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  tgText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  logoutText: {
    color: "#fa5757",
    fontSize: 16,
    marginLeft: 6,
  },
  toast: {
    width: "90%",
    maxWidth: 380,
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  toastMsg: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 4,
  },
});
