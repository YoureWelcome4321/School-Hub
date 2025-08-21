import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function News() {
  const [achievements, setAchievements] = useState([]);
  const [events, setEvents] = useState([]);
  const [olympiads, setOlympiads] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("achievements"); // Доступные: achievements, events, olympiads

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://api.school-hub.ru/news/achievements",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAchievements(response.data);
    } catch (err) {
      setError("Не удалось загрузить достижения");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://api.school-hub.ru/news/events",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents(response.data);
    } catch (err) {
      setError("Не удалось загрузить мероприятия");
    } finally {
      setLoading(false);
    }
  };

  const fetchOlympiads = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://api.school-hub.ru/news/olympiads",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOlympiads(response.data);
    } catch (err) {
      setError("Не удалось загрузить олимпиады");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "achievements") {
      fetchAchievements();
    } else if (activeTab === "events") {
      fetchEvents();
    } else if (activeTab === "olympiads") {
      fetchOlympiads();
    }
  }, [activeTab]);

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

  const openItemDetails = (item) => {
    setSelectedItem(item);
  };

  // Вернуться к списку
  const goBack = () => {
    setSelectedItem(null);
  };

  // Определение данных по активной вкладке
  const getCurrentData = () => {
    if (activeTab === "achievements") return achievements;
    if (activeTab === "events") return events;
    if (activeTab === "olympiads") return olympiads;
    return [];
  };

  // Рендер контента
  const renderTabContent = () => {
    if (selectedItem) {
      return (
        <View style={styles.detailsContainer}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>← Назад</Text>
          </TouchableOpacity>
        <View style={styles.cardContainer}>
          <Text style={styles.detailsTitle}>{selectedItem.title}</Text>
          {selectedItem.image_path ? (
            <Image
              source={{
                uri: "https://api.school-hub.ru/" + selectedItem.image_path,
              }}
              style={styles.detailsImage}
              resizeMode="cover"
            />
          ) : null}
          <Text style={styles.detailsDesc}>{selectedItem.description}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Дата:</Text>
            <Text style={styles.infoValue}>
              {new Date(selectedItem.date).toLocaleDateString("ru-RU")}
            </Text>
          </View>

          {selectedItem.url && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Источник:</Text>
              <Text style={[styles.infoValue, { color: "#007AFF" }]}>
                {selectedItem.url}
              </Text>
            </View>
          )}
          </View>
        </View>
      );
    }

    const data = getCurrentData();

    return (
      <View style={styles.listContainer}>
        {loading ? (
          <Text style={styles.loading}>Загрузка...</Text>
        ) : data.length === 0 ? (
          <>
            <Text style={styles.noDataIcon}>😊</Text>
            <Text style={styles.noData}>Новостей пока нет</Text>
          </>
        ) : (
          data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => openItemDetails(item)}
            >
              {item.image_path ? (
                <Image
                  source={{
                    uri: "https://api.school-hub.ru/" + item.image_path,
                  }}
                  style={styles.cardImage}
                />
              ) : null}

              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.preview} numberOfLines={2}>
                {item.description.substring(0, 120)}...
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>
                  {new Date(item.date).toLocaleDateString("ru-RU")}
                </Text>
                {item.url && (
                  <Text style={[styles.cardMeta, { color: "#007AFF" }]}>
                    Подробнее
                  </Text>
                )}
              
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Новости и события</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "achievements" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("achievements")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "achievements" && styles.activeTabText,
              ]}
            >
              Достижения
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "events" && styles.activeTab]}
            onPress={() => setActiveTab("events")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "events" && styles.activeTabText,
              ]}
            >
              Мероприятия
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "olympiads" && styles.activeTab]}
            onPress={() => setActiveTab("olympiads")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "olympiads" && styles.activeTabText,
              ]}
            >
              Олимпиады
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Контент */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    padding: 16,
  },
  header: {
    marginBottom: 0,
  },
  headerTitle: {
    marginTop: 2,
    textAlign: "center",
    color: "#fff",
    fontWeight: "500",
    fontSize: 26,
    marginBottom: 18,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "#2c2c2c",
    padding: 4,
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
    marginBottom: 6,
    marginTop: 16,
  },
  cardImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  preview: {
    color: "#a2acb4",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  cardMeta: {
    fontSize: 14,
    color: "#9ea8b0",
  },
  detailsContainer: {
    padding:4,
    gap: 16,
   
  },

  cardContainer: {
    padding:22,
    backgroundColor:'#2c2c2c',
    borderRadius:14,
    gap:18
  },

  backText: {
    color: "#007AFF",
    fontSize: 19,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  detailsImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 6,
  },
  detailsDesc: {
    color: "#a2acb4",
    fontSize: 18,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  loading: {
    textAlign: "center",
    color: "#a2acb4",
    fontSize: 20,
    marginTop: 20,
  },

  noDataIcon: {
    textAlign: "center",
    color: "#a2acb4",
    fontSize: 89,
    marginTop: 20,
  }, 
  noData: {
    textAlign: "center",
    color: "#a2acb4",
    fontSize: 20,

  },
  
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    color: "#a2acb4",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
