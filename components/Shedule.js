import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  PanResponder,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [replacement , setReplacement] = useState(false)

  
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

  const formatNumber = (date) => {
    return date.getDate().toString().padStart(2, '0');
  };

  
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
    console.log('Текущая дата изменилась на:', currentDate.toDateString());
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
    return date
      .toLocaleDateString('ru-RU', options)
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  // Обработчик свайпов: переключение между днями
 const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      return Math.abs(dx) > 20 && Math.abs(dy) < 20;
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;

      if (dx > 30) {
        const prevDay = currentDate;
        prevDay.setDate(prevDay.getDate() - 1);
        console.log(prevDay)
        setCurrentDate(new Date(prevDay));
      } else if (dx < -30) {
        const nextDay = currentDate;
        nextDay.setDate(nextDay.getDate() + 1);
        console.log(nextDay)
        setCurrentDate(new Date(nextDay));
      }
    },
  })
).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Заголовок */}
          <View style={styles.headeronmenu}>
            <Text style={styles.headermenu}>Расписание</Text>
          </View>


          {/* Кнопки дней недели */}
          <View style={styles.daysContainer}>
            {weekDates.map((date, index) => {
              const isCurrent =
                date.toDateString() === currentDate.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayButton, isCurrent && styles.dayButtonActive]}
                  onPress={() => setCurrentDate(date)}
                >
                  <Text
                    style={[styles.dayName, isCurrent && styles.dayTextActive]}
                  >
                    {formatDay(date)}
                  </Text>
                  <Text
                    style={[styles.dayNumber, isCurrent && styles.dayTextActive]}
                  >
                    {formatNumber(date)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.weekNavigation}>
           

            <Text style={styles.selectedDateLabel}>
              {formatFullDate(currentDate)}
            </Text>

          </View>

          {/* Список занятий или сообщение */}
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : schedule.length > 0 ?  (
            
            <View style={styles.scheduleList}>
              {schedule.map((lesson, index) => {
                const time = `${lesson.start_time} – ${lesson.stop_time}`;
                const subject = lesson.title || 'Название не указано';
                const room = lesson.classrooms
                  ? '№' + lesson.classrooms.join(', ')
                  : 'не указан';
                const teacher = lesson.teachers
                  ? lesson.teachers.join(', ')
                  : 'Не указан';
                
                return (
                  <View key={index} style={lesson.replacement ? styles.lessonItemReplacement : styles.lessonItem}>
                    {lesson.replacement && (
                      <Text style={{ color: '#d84e4e', fontSize: 16, marginBottom: 4, right:12,top:15, position:'absolute' }}>Замена</Text>)}
                    <Text style={styles.lessonTime}>{time}</Text>
                    <Text style={styles.lessonSubject}>
                      {subject}
                      {replacement}
                    </Text>
                    <Text style={styles.lessonRoom}>Кабинет: {room}</Text>
                    <Text style={styles.lessonRoom}>
                      Преподаватель: {teacher}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <>
            <Image source={require('../assets/noshedule.png')} style={{ width: 170, height: 170, alignSelf: 'center', marginTop: 25}} />
            <Text style={styles.noData}>Расписание на этот день отсутствует, отдыхайте</Text>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headeronmenu: {
    marginBottom: 16,
  },
  headermenu: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '500',
    fontSize: 26,
  },
  container: {
    flex: 1,
    backgroundColor: '#212121',
    padding: 19,
    paddingBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  weekNavigation: {
    marginVertical: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  navArrow: {
    fontSize: 28,
    color: '#007AFF',
    paddingHorizontal: 10,
  },
  selectedDateLabel: {
    fontSize: 16,
    color: '#a2acb4',
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#2c2c2c',
    paddingVertical: 10,
    paddingHorizontal: 12,
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
  loader: {
    marginTop: 20,
  },
  scheduleList: {
    marginTop: 5,
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

  lessonItemReplacement:{
    backgroundColor: '#2c2c2c',
    borderColor: '#d84e4e',
    borderWidth: 2,
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
    color: '#a0a9b1',
    fontSize: 18,
    marginTop: 19,
  },
  error: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});