import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Clubs({ navigation }) {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    direction: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Загрузка списка клубов
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("https://api.school-hub.ru/clubs/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      setClubs(response.data);
    } catch (err) {
      setError("Не удалось загрузить клубы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  // Сброс уведомлений
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Проверка уникальности названия
  const checkTitle = async () => {
    if (!formData.title.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://api.school-hub.ru/clubs/check_title",
        { title: formData.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.data.isUnique) {
        setError("Название уже занято");
      } else {
        setSuccess("Название доступно!");
      }
    } catch (err) {
      setError("Ошибка проверки названия");
    }
  };

  // Создание клуба
  const createClub = async () => {
    if (!formData.title || !formData.description || !formData.direction) {
      setError("Заполните все поля");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://api.school-hub.ru/clubs/new",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClubs([...clubs, response.data]);
      setSuccess("Клуб создан!");
      setIsCreating(false);
      setFormData({ title: "", description: "", direction: "" });
    } catch (err) {
      setError("Не удалось создать клуб");
    }
  };

  // Присоединиться к клубу
  const joinClub = async (clubId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "https://api.school-hub.ru/clubs/join",
        { clubId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Вы присоединились к клубу!");
      setSelectedClub((prev) =>
        prev
          ? { ...prev, joined: true, members_count: prev.members_count + 1 }
          : null
      );
      setClubs((prev) =>
        prev.map((c) =>
          c.id === clubId ? { ...c, joined: true, members_count: c.members_count + 1 } : c
        )
      );
    } catch (err) {
      setError("Не удалось присоединиться");
    }
  };

  // Покинуть клуб
  const leaveClub = async (clubId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "https://api.school-hub.ru/clubs/leave",
        { clubId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Вы покинули клуб");
      setSelectedClub((prev) =>
        prev
          ? { ...prev, joined: false, members_count: Math.max(0, prev.members_count - 1) }
          : null
      );
      setClubs((prev) =>
        prev.map((c) =>
          c.id === clubId
            ? { ...c, joined: false, members_count: Math.max(0, c.members_count - 1) }
            : c
        )
      );
    } catch (err) {
      setError("Не удалось покинуть клуб");
    }
  };

  // Получить детали клуба
  const openClubDetails = async (clubId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`https://api.school-hub.ru/clubs/get/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedClub(response.data);
    } catch (err) {
      setError("Не удалось загрузить информацию о клубе");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Уведомления */}
      {error && (
        <View style={styles.alertError}>
          <Text style={styles.alertText}>{error}</Text>
        </View>
      )}
      {success && (
        <View style={styles.alertSuccess}>
          <Text style={styles.alertText}>{success}</Text>
        </View>
      )}

      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Клубы</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Список клубов */}
        {!selectedClub && !isCreating && (
          <View style={styles.listContainer}>
            {loading ? (
              <Text style={styles.loading}>Загрузка...</Text>
            ) : clubs.length === 0 ? (
              <Text style={styles.noData}>Клубы не найдены</Text>
            ) : (
              clubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.card}
                  onPress={() => openClubDetails(club.id)}
                >
                  <Text style={styles.cardTitle}>{club.title}</Text>
                  <Text style={styles.limits}>Для учеников от {club.class_limit_min} до {club.class_limit_max} класса</Text>
                  <View style={styles.cardFooter}>
  
                    <Text style={styles.cardMeta}>Участников: {club.members_count}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setIsCreating(true)}>
              <Text style={styles.addButtonText}>+ Создать клуб</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Детали клуба */}
        {selectedClub && !isCreating && (
          <View style={styles.detailsContainer}>
            <TouchableOpacity onPress={() => setSelectedClub(null)} style={styles.backButton}>
              <Text style={styles.backText}>← Назад</Text>
            </TouchableOpacity>

            <Text style={styles.detailsTitle}>{selectedClub.title}</Text>
            <Text style={styles.detailsDesc}>{selectedClub.description}</Text>


            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Участников:</Text>
              <Text style={styles.infoValue}>{selectedClub.members_count}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.joinButton,
                selectedClub.joined ? styles.leaveButton : styles.joinButton,
              ]}
              onPress={() =>
                selectedClub.joined
                  ? leaveClub(selectedClub.id)
                  : joinClub(selectedClub.id)
              }
            >
              <Text style={styles.joinButtonText}>
                {selectedClub.joined ? "Покинуть клуб" : "Присоединиться"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Форма создания клуба */}
        {isCreating && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Создать клуб</Text>

            <TextInput
              style={styles.input}
              placeholder="Название клуба"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Описание"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Направление (например: IT, Спорт)"
              value={formData.direction}
              onChangeText={(text) => setFormData({ ...formData, direction: text })}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.checkButton} onPress={checkTitle}>
                <Text style={styles.checkButtonText}>Проверить название</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={createClub}>
                <Text style={styles.saveButtonText}>Создать клуб</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCreating(false)}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Стили
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 26,
  },
  alertError: {
    backgroundColor: "#d84e4e",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertSuccess: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#2c2c2c",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  limits:{
    color: "#9ea8b0",
    fontSize: 15,
    marginBottom: 5,
  },
  cardFooter: {
    gap: 4,
  },
  cardMeta: {
    fontSize: 15,
    color: "#9ea8b0",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  detailsContainer: {
    padding: 16,
    gap: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: "#007AFF",
    fontSize: 16,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  infoLabel: {
    color: "#a2acb4",
    fontSize: 16,
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  joinButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  leaveButton: {
    backgroundColor: "#d84e4e",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    gap: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#2c2c2c",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  checkButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#3a3a3a",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loading: {
    textAlign: "center",
    color: "#a2acb4",
    fontSize: 16,
    marginTop: 20,
  },
  noData: {
    textAlign: "center",
    color: "#a2acb4",
    fontSize: 16,
    marginTop: 20,
  },
});