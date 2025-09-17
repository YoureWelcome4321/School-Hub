import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Linking,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [naprav, setNapravs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    administration: "",
    max_members_counts: "",
    class_limit_min: "",
    class_limit_max: "",
    telegram_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'my', 'all', 'top'

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("https://api.school-hub.ru/clubs/list", {
        headers: { Authorization: `Bearer ${token}` },
        params: { type: activeTab },
      });
      setClubs(response.data);
    } catch (err) {
      console.error(
        "Ошибка загрузки клубов:",
        err.response?.data || err.message
      );
      setError("Не удалось загрузить клубы");
    } finally {
      setLoading(false);
    }
  };

  const fetchNaprav = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://api.school-hub.ru/clubs/administrations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = Array.isArray(response.data) ? response.data : [];
      setNapravs(data);
    } catch (err) {
      console.error(
        "Ошибка загрузки направлений:",
        err.response?.data || err.message
      );
      setError("Ошибка загрузки направлений");
      setNapravs([]); // на всякий случай
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchNaprav();
  }, [activeTab]);

  // Фильтрация и сортировка
  useEffect(() => {
    if (activeTab === "my") {
      setFilteredClubs(
        clubs.filter((club) => !(club.joined || club.participant))
      );
    } else if (activeTab === "all") {
      setFilteredClubs(
        clubs.filter((club) => !(club.joined || club.participant))
      );
    } else if (activeTab === "top") {
      const sorted = [...clubs]
        .sort((a, b) => b.members_count - a.members_count)
        .slice(0, 10);
      setFilteredClubs(sorted);
    }
  }, [activeTab, clubs]);

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

  // Проверка названия
  const checkTitle = async () => {
    const { title } = formData;
    if (!title.trim()) {
      setError("Введите название для проверки");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://api.school-hub.ru/clubs/check_title",
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setSuccess("✅ Название доступно!");
      } else {
        setError("❌ Название уже занято");
      }
    } catch (err) {
      setError("Ошибка проверки названия");
    }
  };

  const createClub = async () => {
    setError(null);

    const {
      title,
      description,
      administration,
      max_members_counts,
      class_limit_min,
      class_limit_max,
      telegram_url,
    } = formData;

    // Валидация
    if (!title.trim()) return setError("Введите название клуба");
    if (title.length < 3)
      return setError("Название должно быть не менее 3 символов");
    if (!description.trim()) return setError("Добавьте описание");
    if (description.length < 10) return setError("Описание слишком короткое");
    if (!administration) return setError("Выберите направление");
    if (
      max_members_counts &&
      max_members_counts < 5 &&
      max_members_counts !== "0"
    ) {
      return setError("Макс. участников: 0 (бесконечно) или ≥5");
    }

    const min = parseInt(class_limit_min, 10);
    const max = parseInt(class_limit_max, 10);

    if (class_limit_min && (min < 1 || min > 11))
      return setError("Мин. класс — от 1 до 11");
    if (class_limit_max && (max < 1 || max > 11))
      return setError("Макс. класс — от 1 до 11");
    if (class_limit_min && class_limit_max && min > max)
      return setError("Мин. класс не может быть больше макс.");

    if (
      telegram_url &&
      !/^https?:\/\/t\.me\/[a-zA-Z0-9_]+$/i.test(telegram_url.trim())
    ) {
      return setError(
        "Некорректная ссылка Telegram (пример: https://t.me/club123)"
      );
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        administration: parseInt(administration, 10),
        max_members_counts: max_members_counts
          ? parseInt(max_members_counts, 10)
          : 0,
        class_limit_min: min || 1,
        class_limit_max: max || 11,
        telegram_url: telegram_url.trim() || null,
      };

      const response = await axios.post(
        "https://api.school-hub.ru/clubs/new",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClubs([...clubs, response.data]);
      setSuccess("✅ Клуб успешно создан!");
      setIsCreating(false);
      setFormData({
        title: "",
        description: "",
        administration: "",
        max_members_counts: "",
        class_limit_min: "",
        class_limit_max: "",
        telegram_url: "",
      });
    } catch (err) {
      console.error(
        "Ошибка создания клуба:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Не удалось создать клуб. Попробуйте позже."
      );
    }
  };

  const joinClub = async (clubId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://api.school-hub.ru/clubs/join",
        { club_id: clubId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      openClubDetails(selectedClub.id);
    } catch (err) {
      console.error(
        "Не удалось присоединится в клуб",
        err.response?.data || err.message
      );
    }
  };

  // Покинуть
  const leaveClub = async (clubId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(
        "https://api.school-hub.ru/clubs/leave",
        { club_id: clubId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      openClubDetails(selectedClub.id);
    } catch (err) {
      console.error(
        "Не удалось покинуть клуб",
        err.response?.data || err.message
      );
    }
  };

  // Детали клуба
  const openClubDetails = async (clubId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get("https://api.school-hub.ru/clubs/get", {
        headers: { Authorization: `Bearer ${token}` },
        params: { club_id: clubId },
      });
      setSelectedClub(response.data);
    } catch (err) {
      console.error(
        "Не удалось загрузить информацию о клубе:",
        err.response?.data || err.message
      );
      setError("Не удалось загрузить информацию о клубе");
    }
  };

  return (
    <View style={styles.container}>
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

      {!isCreating && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => {setSelectedClub(null), fetchClubs() ,setActiveTab("all")}}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              Все
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "my" && styles.activeTab]}
            onPress={() => {setSelectedClub(null), fetchClubs() ,setActiveTab("my")}}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "my" && styles.activeTabText,
              ]}
            >
              Мои
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "top" && styles.activeTab]}
            onPress={() => {setSelectedClub(null), fetchClubs() ,setActiveTab("top")}}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "top" && styles.activeTabText,
              ]}
            >
              Топ
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {!selectedClub && !isCreating && (
          <View style={styles.listContainer}>
            {loading ? (
              <Text style={styles.loading}>Загрузка...</Text>
            ) : filteredClubs.length === 0 ? (
              <Text style={styles.noData}>Клубы не найдены</Text>
            ) : (
              filteredClubs.map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.card}
                  onPress={() => openClubDetails(club.id)}
                >
                  <Text style={styles.cardTitle}>{club.title}</Text>
                  <Text style={styles.limits}>
                    Для учеников от {club.class_limit_min} до{" "}
                    {club.class_limit_max} класса
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardMeta}>
                      Участников: {club.members_count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsCreating(true)}
            >
              <Text style={styles.addButtonText}>+ Создать клуб</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedClub && !isCreating && (
          <View style={styles.detailsContainer}>
            <TouchableOpacity
              onPress={() => {
                setSelectedClub(null), fetchClubs();
              }}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Назад</Text>
            </TouchableOpacity>

            <Text style={styles.detailsTitle}>{selectedClub.title}</Text>

            {selectedClub.image_path ? (
              <Image
                source={{ uri: selectedClub.image_path }}
                style={styles.clubImage}
              />
            ) : null}

            {selectedClub.description ? (
              <View style={styles.section}>
                <Text style={styles.detailsDesc}>
                  {selectedClub.description}
                </Text>
              </View>
            ) : null}


            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Направление:</Text>
                <Text style={styles.infoValue}>
                  {selectedClub.administration || "—"} 
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Классы:</Text>
                <Text style={styles.infoValue}>
                  {selectedClub.class_limit_min}–{selectedClub.class_limit_max}{" "}
                  📚
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Участники:</Text>
                <Text style={styles.infoValue}>
                  {selectedClub.members_count} /{" "}
                  {selectedClub.max_members_counts > 0
                    ? selectedClub.max_members_counts
                    : "∞"}{" "}
                  👥
                </Text>
              </View>

              {selectedClub.xp !== undefined && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Опыт:</Text>
                  <Text style={styles.infoValue}>{selectedClub.xp} XP ⚡</Text>
                </View>
              )}
            </View>

            {selectedClub.participant && (
              <>
                <View style = {styles.ParticipantContainer}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(selectedClub.telegram_url)}
                    style={styles.joinTgClub}
                  >
                    <Text style={styles.joinTgClubText}>
                      Присоединяйся к клубу в телеграм
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.joinButton,
                selectedClub.joined || selectedClub.participant
                  ? styles.leaveButton
                  : styles.joinButton,
              ]}
              onPress={() =>
                selectedClub.joined || selectedClub.participant
                  ? leaveClub(selectedClub.id)
                  : joinClub(selectedClub.id)
              }
            >
              <Text style={styles.joinButtonText}>
                {selectedClub.participant ? "Покинуть клуб" : "Присоединиться"}
              </Text>
            </TouchableOpacity>

          </View>
        )}

        {isCreating && (
          <View style={styles.formContainer}>
            <TouchableOpacity
              onPress={() => setIsCreating(false)}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Назад</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>Создание нового клуба:</Text>

            <TextInput
              style={styles.input}
              placeholder="Название клуба"
              placeholderTextColor="gray"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              maxLength={50}
              autoCapitalize="sentences"
            />
            <TouchableOpacity style={styles.checkButton} onPress={checkTitle}>
              <Text style={styles.checkButtonText}>🔍 Проверить название</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Описание клуба (расскажите, чем занимается клуб)"
              placeholderTextColor="gray"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              textAlignVertical="top"
              maxLength={500}
            />

            {/* Выбор направления */}
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setIsPickerOpen(!isPickerOpen)}
            >
              <Text
                style={
                  formData.administration
                    ? styles.pickerText
                    : styles.pickerPlaceholder
                }
              >
                {formData.administration
                  ? naprav.find(
                      (n) => n.id === parseInt(formData.administration, 10)
                    )?.title || "Выберите направление..."
                  : "Выберите направление..."}
              </Text>
            
            </TouchableOpacity>
            
            {isPickerOpen && naprav.length > 0 && (
            
              <View style={styles.pickerOptions}>
                 <ScrollView >
                {naprav.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.pickerOption}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        administration: item.id.toString(),
                      });
                      setIsPickerOpen(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
                </ScrollView>
              </View>
              
            )}
            

            <TextInput
              style={styles.input}
              placeholder="Макс. участников (0 = бесконечно, ≥5)"
              placeholderTextColor="gray"
              value={formData.max_members_counts}
              keyboardType="number-pad"
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  max_members_counts: text.replace(/[^0-9]/g, ""),
                })
              }
            />

            <View style={styles.rowInput}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Мин. класс (1-11)"
                placeholderTextColor="gray"
                value={formData.class_limit_min}
                keyboardType="number-pad"
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    class_limit_min: text.replace(/[^0-9]/g, ""),
                  })
                }
                maxLength={2}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Макс. класс (1-11)"
                placeholderTextColor="gray"
                value={formData.class_limit_max}
                keyboardType="number-pad"
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    class_limit_max: text.replace(/[^0-9]/g, ""),
                  })
                }
                maxLength={2}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ссылка на Telegram (https://t.me/...)"
              placeholderTextColor="gray"
              value={formData.telegram_url}
              onChangeText={(text) =>
                setFormData({ ...formData, telegram_url: text })
              }
              autoCapitalize="none"
              autoComplete="off"
            />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    paddingTop: 40,
    paddingBottom: 20,
    padding: 1,
  },
  header: {
    marginBottom: 0,
    paddingTop: 14,
  },
  headerTitle: {
    marginTop: 2,
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 26,
    marginBottom: 18,
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
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "#2c2c2c",
    padding: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    color: "#a2acb4",
    fontSize: 15,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "500",
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#2c2c2c",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  limits: {
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
    marginHorizontal: 16,
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
    marginBottom: 4,
  },
  backText: {
    color: "#007AFF",
    fontSize: 19,
  },
  detailsTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  clubImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
    marginTop: 12,
    marginBottom: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  detailsDesc: {
    color: "#a2acb4",
    fontSize: 19,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 6,
    marginBottom: 5,
  },
  infoItem: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    padding: 12,
    minWidth: "48%",
    flex: 1,
  },
  infoLabel: {
    fontSize: 18,
    color: "#a2acb4",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },

  ParticipantContainer:{
    gap:0
  },

  participant: {
    color: "#a2acb4",
    fontSize: 19,
    lineHeight: 20,
  },

  joinTgClub:{
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 2,
  },

  joinTgClubText:{
    color: "#fff",
    fontSize: 17,
    lineHeight: 28,
  },
  

  joinButton: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
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
    paddingHorizontal: 16,
  },
  formTitle: {
    fontSize: 25,
    fontWeight: "500",
    color: "#fff",
    marginVertical: 4,
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
  rowInput: {
    flexDirection: "row",
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  checkButton: {
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
  pickerButton: {
    backgroundColor: "#2c2c2c",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  pickerPlaceholder: {
    color: "gray",
    fontSize: 16,
  },
  pickerText: {
    color: "#fff",
    fontSize: 16,
  },
  pickerOptions: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    marginTop: 4,
    overflow: "hidden",
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3a3a",
  },
  pickerOptionText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Clubs;
