import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]); 


  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - (day === 0 ? 6 : day - 1); 
    const monday = new Date(date);
    monday.setDate(diff);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDay = (date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  };

  // Форматируем число (день месяца)
  const formatNumber = (date) => {
    return date.getDate().toString().padStart(2, '0');
  };

  // Функция для получения расписания по дате
  const fetchSchedule = async (date) => {
    setLoading(true);
    setError(null);
    setSchedule([]);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const formattedDate = date.toISOString().split('T')[0];

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const url = `https://api.school-hub.ru/schedule?date=${formattedDate}`;
      const response = await axios.get(url, config);

      if (!Array.isArray(response.data)) {
        throw new Error('Некорректный формат данных от сервера');
      }

      setSchedule(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Не удалось загрузить расписание';
      setError(errorMessage);
      console.log('Ошибка загрузки расписания:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    setWeekDates(getWeekDates(currentDate));
  }, [currentDate]);

  
  useEffect(() => {
    fetchSchedule(currentDate);
  }, [currentDate]);

 

  const formatFullDate = (date) => {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('ru-RU', options).replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false} 
              bounces={false} 
            >
      <View style={styles.headeronmenu}>
        <Text style={styles.headermenu}>Расписание</Text>
      </View>

  
      
      <View style={styles.daysContainer}>
        {weekDates.map((date, index) => {
          const isCurrent = date.toDateString() === currentDate.toDateString();
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayButton, isCurrent && styles.dayButtonActive]}
              onPress={() => setCurrentDate(date)}
            >
              <Text style={[styles.dayName, isCurrent && styles.dayTextActive]}>
                {formatDay(date)}
              </Text>
              <Text style={[styles.dayNumber, isCurrent && styles.dayTextActive]}>
                {formatNumber(date)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    
      <Text style={styles.selectedDate}>{formatFullDate(currentDate)}</Text>

      {/* Расписание */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : schedule.length > 0 ? (
        <View style={styles.scheduleList}>
          {schedule.map((lesson, index) => {
            const time = `${lesson.start_time} – ${lesson.stop_time}`;
            const subject = lesson.title || 'Название не указано';
            const room = lesson.classrooms ? lesson.classrooms.join(', ') : 'Аудитория не указана';

            return (
              <View key={index} style={styles.lessonItem}>
                <Text style={styles.lessonTime}>{time}</Text>
                <Text style={styles.lessonSubject}>{subject}</Text>
                <Text style={styles.lessonRoom}>Аудитория: {room}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.noData}>Расписание на этот день отсутствует</Text>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headeronmenu: {
    textAlign: 'center',
    marginBottom: 16,
    paddingTop: 14,
  },
  headermenu: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '500',
    fontSize: 22,
  },

  container: {
    flex: 1,
    backgroundColor: '#212121',
    padding: 16,
  },

  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 10,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 24,
    color: '#007AFF',
  },

  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#2c2c2c',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayButtonActive: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
  },
  dayName: {
    fontSize: 12,
    color: '#a2acb4',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dayTextActive: {
    color: '#fff',
  },

  selectedDate: {
    fontSize: 16,
    color: '#a2acb4',
    textAlign: 'center',
    marginBottom: 4,
  },

  loader: {
    marginTop: 20,
  },

  scheduleList: {
    marginTop: 10,
  },
  lessonItem: {
    backgroundColor: '#2c2c2c',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonTime: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  lessonSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#fff',
  },
  lessonRoom: {
    fontSize: 14,
    color: '#a2acb4',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  error: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});