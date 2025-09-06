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
  KeyboardAvoidingView,
  Platform,
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

  const showToast = (type, title, message) => {
    Toast.show({
      type,
      text1: title,
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      position: "top",
      topOffset: 60,
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
      showToast("error", "Ошибка", "Не удалось загрузить данные.");
    }
  };

  useEffect(() => {
    getProfileData();
  }, []);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const TelegramOut = async() => {
    const token = await AsyncStorage.getItem('token')
    try {
    const response = await axios.delete("https://api.school-hub.ru/settings/telegram/out",{
      headers:{
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Телеграм успешно отвязан')
  } catch(err){
    console.log(`Ошибка отвязки телеграм: ${err}`)
  }

  }

  const handlePress = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://api.school-hub.ru/settings/telegram/connect",
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      const url = response.data?.url;
      if (!url || typeof url !== "string" || !url.trim()) {
        alert("Не удалось получить ссылку для входа. Попробуйте позже.");
        return;
      }
      if (!/^https?:\/\//i.test(url.trim())) {
        alert("Некорректная ссылка для открытия.");
        return;
      }
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url.trim());
      } else {
        alert(
          "Не удалось открыть ссылку. Убедитесь, что у вас установлен Telegram."
        );
      }
    } catch (error) {
      alert("Ошибка при получении или открытии Telegram-ссылки.");
    }
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.headerFixed}>
        <Text style={styles.header}>Профиль</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
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
          {isEditing ? (
             profileData.telegram_name ? (
            <>
              <Text style={styles.label}>Telegram Username</Text>
              <TouchableOpacity style={styles.actionButtonOut} onPress={TelegramOut}>
                <Text style={styles.actionButtonText}>Отвязать Telegram</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
            <Text style={styles.label}>Telegram Username</Text>
            <TouchableOpacity onPress={handlePress} style={styles.telegramBtn}>
              <Image
                source={require("../assets/TelegramLogo.png")}
                style={styles.tgIcon}
              />
              <Text style={styles.tgText}>Привязать Telegram</Text>
            </TouchableOpacity>
            </>
          )) : 
            profileData.telegram_name ? (
            <>
              <Text style={styles.label}>Telegram Username</Text>
              <TextInput
                style={styles.input}
                value={`@${profileData.telegram_name}`}
                editable={false}
              />
            </>
          ) : (
            <>
            <Text style={styles.label}>Telegram Username</Text>
            <TouchableOpacity onPress={handlePress} style={styles.telegramBtn}>
              <Image
                source={require("../assets/TelegramLogo.png")}
                style={styles.tgIcon}
              />
              <Text style={styles.tgText}>Привязать Telegram</Text>
            </TouchableOpacity>
            </>
          )}
          {/* Выход */}
          <TouchableOpacity style={styles.logoutBtn} onPress={Exit}>
            <MaterialCommunityIcons
              name="exit-to-app"
              color="#fa5757"
              size={20}
            />
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Toast */}
      <Toast
        config={{
          success: (internal) => (
            <View style={[styles.toast, { backgroundColor: "#007AFF" }]}>
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
            <View style={[styles.toast, { backgroundColor: "#007AFF" }]}>
              <Text style={styles.toastTitle}>{internal.text1}</Text>
              {internal.text2 && (
                <Text style={styles.toastMsg}>{internal.text2}</Text>
              )}
            </View>
          ),
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
  },
  headerFixed: {
    paddingTop: 10,
    paddingHorizontal: 24,
    backgroundColor: "#212121",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#232323",
    paddingBottom: 18,
  },
  header: {
    fontSize: 26,
    fontWeight: "500",
    color: "#fff",
    textAlign: "center",
    marginTop: 11,
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 0,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  class: {
    fontSize: 17,
    color: "#aaa",
    marginTop: 2,
  },
  scrollContent: {
    padding: 24,
    alignItems: "center",
    paddingBottom: 40,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    alignSelf: "center",
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 6,
    width: "100%",
  },
  input: {
    width: "100%",
    height: 44,
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#2c2c2c",
    marginBottom: 14,
  },
  inputActive: {
    borderColor: "#007AFF",
  },
  actionButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
  },

  actionButtonOut: {
    width: "100%",
    backgroundColor: "#fa5757",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  emailRow: {
    flexDirection: "row",
    width: "100%",
  },
  confirmBtn: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
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
    borderRadius: 8,
  },
  smallText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  telegramBtn: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 6,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  tgIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  tgText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    alignSelf: "center",
  },
  logoutText: {
    color: "#fa5757",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
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
